import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const createProject = mutation({
  args: {
    projectName: v.string(),
    githubUrl: v.string(), // Required GitHub URL
    githubToken: v.optional(v.string()), // Optional GitHub token
    // Accept sharedWith as an optional record with emails as keys and roles as values
    sharedWith: v.optional(v.record(v.string(), v.string())),
  },
  async handler(ctx, args) {
    // Get the authenticated user's identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("User not authenticated");
    }

    // Find the user in the database by their email from the identity
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Insert a new project linked to the authenticated user.
    // The sharedWith field will use the passed object or default to an empty object.
    const projectId = await ctx.db.insert("project", {
      userId: user._id,
      projectName: args.projectName,
      githubUrl: args.githubUrl,
      githubToken: args.githubToken || "",
      role: "owner", // The creator is the owner.
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: "",
      sharedWith: args.sharedWith || {}, // Default to an empty object if not provided.
    });

    return { projectId };
  },
});

// Query to get all projects for a user (either owned or shared with)
export const getUserProjects = query({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    // 1. Look up the user by clerkId.
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();
    if (!user) {
      throw new ConvexError("User not found");
    }

    // 2. Query projects where the user is the owner.
    const ownedProjects = await ctx.db
      .query("project")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    // 3. Query candidate projects that have a non-empty sharedWith record.
    const sharedCandidates = await ctx.db
      .query("project")
      .filter((q) => q.not(q.eq(q.field("sharedWith"), {})))
      .collect();

    // 4. Filter the candidate projects in memory to only include those
    //    where the sharedWith record has a property equal to the user's email.
    const sharedProjects = sharedCandidates.filter((project) => {
      return (
        project.sharedWith &&
        Object.prototype.hasOwnProperty.call(project.sharedWith, user.email)
      );
    });

    // 5. Merge the two lists, avoiding duplicates.
    const projectMap = new Map();
    for (const proj of ownedProjects) {
      projectMap.set(proj._id, proj);
    }
    for (const proj of sharedProjects) {
      projectMap.set(proj._id, proj);
    }

    return Array.from(projectMap.values());
  },
});

export const getProjectByProjectId = query({
  args: {
    projectId: v.id("project"),
  },
  async handler(ctx, args) {
    // Get the authenticated user's identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("User not authenticated");
    }

    // Find the user in the database by their email from the identity
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Get the project by ID
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new ConvexError("Project not found");
    }

    // Check if user has access to the project
    const isOwner = project.userId === user._id;
    const isSharedWithUser =
      project.sharedWith &&
      Object.prototype.hasOwnProperty.call(project.sharedWith, user.email);

    if (!isOwner && !isSharedWithUser) {
      throw new ConvexError("User does not have access to this project");
    }

    // Return the project with the user's role
    return {
      ...project,
      role: isOwner ? "owner" : project.sharedWith[user.email],
    };
  },
});

export const getProjectTeam = query({
  args: { projectId: v.id("project") },
  async handler(ctx, { projectId }) {
    // Get the project.
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new ConvexError("Project not found");
    }

    const team = [];

    // Get owner info.
    const owner = await ctx.db.get(project.userId);
    if (owner) {
      team.push({
        email: owner.email,
        role: "owner",
        name: owner.name,
        imageUrl: owner.imageUrl || null,
        clerkId: owner.clerkId,
      });
    }

    // Get team members from sharedWith record.
    const sharedWith = project.sharedWith || {};
    for (const email in sharedWith) {
      // Attempt to get user info for this email.
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), email))
        .unique();
      team.push({
        email,
        role: sharedWith[email],
        name: user ? user.name : email,
        imageUrl: user ? user.imageUrl : null,
        clerkId: user ? user.clerkId : null,
      });
    }
    return team;
  },
});

export const inviteUsersToProject = mutation({
  args: {
    projectId: v.id("project"),
    // A record mapping email to role.
    invites: v.record(v.string(), v.string()),
  },
  async handler(ctx, args) {
    const { projectId, invites } = args;
    // Ensure the user is authenticated.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("User not authenticated");
    }

    // Look up the current user by email.
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .unique();
    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    // Get the project.
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new ConvexError("Project not found");
    }
    // Only the owner can invite new users.
    if (project.userId !== currentUser._id) {
      throw new ConvexError("Only the owner can invite users");
    }

    // Merge existing sharedWith with new invites.
    const updatedSharedWith = { ...(project.sharedWith || {}), ...invites };

    // Update the project record.
    await ctx.db.patch(projectId, { sharedWith: updatedSharedWith });

    return { invited: true, message: "Users invited successfully" };
  },
});

export const removeUserAccess = mutation({
  args: {
    projectId: v.id("project"),
    email: v.string(),
  },
  async handler(ctx, args) {
    const { projectId, email } = args;
    // Ensure the user is authenticated.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("User not authenticated");
    }

    // Look up the current user.
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .unique();
    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    // Get the project.
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new ConvexError("Project not found");
    }
    // Only the owner can remove user access.
    if (project.userId !== currentUser._id) {
      throw new ConvexError("Only the owner can remove user access");
    }

    // Remove the specified email from the sharedWith record.
    const updatedSharedWith = { ...project.sharedWith };
    delete updatedSharedWith[email];

    await ctx.db.patch(projectId, { sharedWith: updatedSharedWith });

    return { removed: true, message: `Access removed for ${email}` };
  },
});

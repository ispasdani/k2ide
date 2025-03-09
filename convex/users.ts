import { ConvexError, v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

// Query to get a user by their clerkId.
export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // this query is used to get the top user by podcast count. first the podcast is sorted by views and then the user is sorted by total podcasts, so the user with the most podcasts will be at the top.
    // export const getTopUserByPodcastCount = query({
    //   args: {},
    //   handler: async (ctx, args) => {
    //     const user = await ctx.db.query("users").collect();

    //     const userData = await Promise.all(
    //       user.map(async (u) => {
    //         const podcasts = await ctx.db
    //           .query("podcasts")
    //           .filter((q) => q.eq(q.field("authorId"), u.clerkId))
    //           .collect();

    //         const sortedPodcasts = podcasts.sort((a, b) => b.views - a.views);

    //         return {
    //           ...u,
    //           totalPodcasts: podcasts.length,
    //           podcast: sortedPodcasts.map((p) => ({
    //             podcastTitle: p.podcastTitle,
    //             pocastId: p._id,
    //           })),
    //         };
    //       })
    //     );

    //     return userData.sort((a, b) => b.totalPodcasts - a.totalPodcasts);
    //   },
    // });

    return user;
  },
});

// Mutation to create a new user, with optional LinkedIn and GitHub profile fields.
export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    name: v.string(),
    credits: v.number(),
    // Optional new fields:
    linkedInProfile: v.optional(v.string()),
    githubProfile: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      imageUrl: args.imageUrl,
      name: args.name,
      credits: args.credits,
      // If the profiles are not provided, they can be stored as empty strings
      linkedInProfile: args.linkedInProfile || "",
      githubProfile: args.githubProfile || "",
    });
  },
});

// Mutation to update an existing user.
// You can update email, imageUrl, and the new profile fields.
export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    // Make these fields optional so that you can update one or several at a time.
    imageUrl: v.optional(v.string()),
    email: v.optional(v.string()),
    linkedInProfile: v.optional(v.string()),
    githubProfile: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // const podcast = await ctx.db
    //   .query("podcasts")
    //   .filter((q) => q.eq(q.field("authorId"), args.clerkId))
    //   .collect();

    // await Promise.all(
    //   podcast.map(async (p) => {
    //     await ctx.db.patch(p._id, {
    //       authorImageUrl: args.imageUrl,
    //     });
    //   })
    // );

    // Build an update object that includes only the fields provided in args.
    const updatePayload: Record<string, unknown> = {};

    if (args.imageUrl !== undefined) {
      updatePayload.imageUrl = args.imageUrl;
    }
    if (args.email !== undefined) {
      updatePayload.email = args.email;
    }
    if (args.linkedInProfile !== undefined) {
      updatePayload.linkedInProfile = args.linkedInProfile;
    }
    if (args.githubProfile !== undefined) {
      updatePayload.githubProfile = args.githubProfile;
    }

    await ctx.db.patch(user._id, updatePayload);
  },
});

// Mutation to delete a user by their clerkId.
export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.delete(user._id);
  },
});

// File: components/ProjectTeam.tsx
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// A simple modal component for inviting a user.
const InviteUserModal: React.FC<{
  onClose: () => void;
  onInvite: (email: string, role: string) => void;
}> = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(email, role);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md w-80">
        <h2 className="text-lg font-bold mb-4">Invite User</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded px-2 py-1 w-full mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select
            className="border border-gray-300 rounded px-2 py-1 w-full mb-4"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="member">Member</option>
            <option value="owner">Owner</option>
          </select>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-3 py-1 rounded border border-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// The main component for displaying the project team.
const ProjectTeam: React.FC<{ projectId: Id<"project"> }> = ({ projectId }) => {
  // Query the team data for the project.
  const team = useQuery(api.projects.getProjectTeam, { projectId }) as Array<{
    email: string;
    role: string;
    name: string;
    imageUrl: string | null;
    clerkId: string | null;
  }> | null;

  const removeUserAccess = useMutation(api.projects.removeUserAccess);
  const inviteUsersToProject = useMutation(api.projects.inviteUsersToProject);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleInvite = async (email: string, role: string) => {
    await inviteUsersToProject({ projectId, invites: { [email]: role } });
    setModalOpen(false);
  };

  const handleRemove = async (email: string) => {
    await removeUserAccess({ projectId, email });
  };

  if (!team) return <div>Loading team...</div>;

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Project Team</h2>
      <div className="space-y-3">
        {team.map((member) => (
          <div
            key={member.email}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div className="flex items-center space-x-3">
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300" />
              )}
              <div>
                <div className="font-semibold">{member.name}</div>
                <div className="text-sm text-gray-600">{member.email}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 bg-gray-200 rounded text-sm">
                {member.role}
              </span>
              {/* Only allow removal for non-owner members */}
              {member.role !== "owner" && (
                <button
                  onClick={() => handleRemove(member.email)}
                  className="px-2 py-1 text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Invite User
        </button>
      </div>
      {isModalOpen && (
        <InviteUserModal
          onClose={() => setModalOpen(false)}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
};

export default ProjectTeam;

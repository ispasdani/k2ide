"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InviteUserModal } from "./InviteUserModal";

// Main ProjectTeam component
const ProjectTeam: React.FC<{ projectId: Id<"project"> }> = ({ projectId }) => {
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

  if (!team) return <div className="text-gray-500">Loading team...</div>;

  return (
    <Card className="w-full bg-sidebar border-sidebar-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Project Team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {team.map((member) => (
          <div
            key={member.email}
            className="flex items-center justify-between py-2 border-b border-sidebar-border last:border-b-0"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={member.imageUrl || undefined}
                  alt={member.name}
                />
                <AvatarFallback className="bg-[#3C3C3C] text-gray-300">
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{member.name}</div>
                <div className="text-sm text-muted-foreground">
                  {member.email}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Badge
                variant={"outline"}
                className={
                  member.role === "owner"
                    ? "bg-blue-500 text-white h-[32px] px-3"
                    : "bg-[#3C3C3C] text-white h-[32px] px-3"
                }
              >
                {member.role}
              </Badge>
              {member.role !== "owner" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(member.email)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-200 ml-3 cursor-pointer"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
        <div className="mt-4">
          <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 text-white hover:bg-blue-700">
                Invite User
              </Button>
            </DialogTrigger>
            {isModalOpen && (
              <InviteUserModal
                onClose={() => setModalOpen(false)}
                onInvite={handleInvite}
              />
            )}
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectTeam;

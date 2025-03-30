import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";

// Invite User Modal (now using Shadcn Dialog)
export const InviteUserModal: React.FC<{
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white border-sidebar-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Invite User
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-siderbar border-sidebar-border placeholder-gray-500"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-sidebar border-sidebar-border">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-sidebar border-sidebar-border">
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white text-black border-[#4E4E4E] hover:bg-[#3C3C3C] hover:text-white cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-700 cursor-pointer"
            >
              Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

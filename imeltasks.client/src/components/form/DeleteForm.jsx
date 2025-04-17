// src/components/admin/UserDeleteDialog.jsx
import { Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const UserDeleteDialog = ({ open, user, onClose, onConfirm }) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
       Are you sure you want to delete the user <strong>{user.name}</strong> ({user.email})?
       This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
       Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
       Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDeleteDialog;

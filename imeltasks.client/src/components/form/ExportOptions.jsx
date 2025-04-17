// src/components/admin/ExportOptions.jsx
import { Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ExportOptions = ({ open, onClose, onExport }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Users</DialogTitle>
          <DialogDescription>
       Choose a format to export the user list.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 pt-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24"
            onClick={() => onExport('csv')}
          >
            <span className="text-2xl mb-2">📄</span>
            <span>CSV</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24"
            onClick={() => onExport('excel')}
          >
            <span className="text-2xl mb-2">📊</span>
            <span>Excel</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24"
            onClick={() => onExport('pdf')}
          >
            <span className="text-2xl mb-2">📑</span>
            <span>PDF</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportOptions;

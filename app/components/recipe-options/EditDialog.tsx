import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

type EditFormProps = {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
};

const EditForm = ({ onSubmit, isLoading }: EditFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="note">Instructions</Label>
      <Input
        type="text"
        id="note"
        name="note"
        placeholder="Enter instructions for editing the recipe..."
        className="w-full"
      />
    </div>
    <div className="flex justify-start">
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Editing...
          </>
        ) : (
          'Edit Recipe'
        )}
      </Button>
    </div>
  </form>
);

type StatusDisplayProps = {
  run: {
    status: string;
    startedAt?: string;
    finishedAt?: string;
    error?: { message: string };
  };
};

const StatusDisplay = ({ run }: StatusDisplayProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className={cn('px-2 py-1 rounded-md text-sm font-medium')}>
        {run.status}
      </div>
    </div>
    {run.startedAt && (
      <div className="text-sm text-neutral-500 dark:text-neutral-400">
        Started: {new Date(run.startedAt).toLocaleString()}
      </div>
    )}
    {run.finishedAt && (
      <div className="text-sm text-neutral-500 dark:text-neutral-400">
        Finished: {new Date(run.finishedAt).toLocaleString()}
      </div>
    )}
    {run.error && (
      <div className="text-sm text-red-500">
        Error: {run.error.message}
      </div>
    )}
  </div>
);

type EditDialogProps = {
  onEdit: (e: React.FormEvent) => void;
  isLoading: boolean;
  run?: any;
};

export const EditDialog = ({ onEdit, isLoading, run }: EditDialogProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm">
        <Pencil className="md:mr-2 h-4 w-4" />
        <span className="sr-only md:not-sr-only">Edit</span>
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Recipe</DialogTitle>
        <DialogDescription>
          Edit your recipe with the power of AI.
        </DialogDescription>
      </DialogHeader>
      {!!run?.status && run?.status !== 'COMPLETED' ? (
        <StatusDisplay run={run} />
      ) : (
        <EditForm onSubmit={onEdit} isLoading={isLoading} />
      )}
    </DialogContent>
  </Dialog>
); 
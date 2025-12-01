import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Routes } from "@/constants/router";
import { useDeleteNoteMutation } from "@/lib/store/api/notes/queries";
import { useRouter } from "next/navigation";

export default function DeleteAlert({
  noteId,
  trigger,
}: {
  noteId: string;
  trigger: React.ReactNode;
}) {
  const router = useRouter();

  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

  const handleDeleteNote = async () => {
    try {
      await deleteNote(noteId).unwrap();
      router.push(Routes.HOME);
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger disabled={isDeleting} asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Note</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this note? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteNote}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

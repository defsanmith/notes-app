"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { defaultExtensions } from "@/lib/editor/extensions";
import { slashCommand, suggestionItems } from "@/lib/editor/slash-command";
import { useUpdateNoteMutation } from "@/lib/store/api/notes/queries";
import { IconTrash } from "@tabler/icons-react";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  handleCommandNavigation,
  type JSONContent,
} from "novel";
import * as React from "react";
import { useDebouncedCallback } from "use-debounce";
import DeleteAlert from "./delete-alert";

interface NoteEditorProps {
  noteId: string;
  initialTitle?: string;
  initialContent?: JSONContent;
}

export function NoteEditor({
  noteId,
  initialTitle = "Untitled",
  initialContent,
}: NoteEditorProps) {
  const [title, setTitle] = React.useState(initialTitle);

  // Prepare initial content for Novel - only computed once
  const editorInitialContent = React.useMemo(() => {
    if (
      initialContent &&
      typeof initialContent === "object" &&
      "type" in initialContent
    ) {
      return initialContent;
    }
    // Default empty document structure for Novel/Tiptap
    return undefined;
  }, [initialContent]);

  // Initialize currentContent with the editor initial content or empty doc
  const [currentContent, setCurrentContent] = React.useState<JSONContent>(
    editorInitialContent || {
      type: "doc",
      content: [],
    }
  );

  const [saveStatus, setSaveStatus] = React.useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [updateNote] = useUpdateNoteMutation();

  // Combine extensions
  const extensions = React.useMemo(
    () => [...defaultExtensions, slashCommand],
    []
  );

  // Debounced save function
  const debouncedSave = useDebouncedCallback(
    async (newTitle: string, newContent: JSONContent) => {
      setSaveStatus("saving");
      try {
        await updateNote({
          noteId,
          data: {
            title: newTitle,
            content: newContent,
          },
        }).unwrap();
        setSaveStatus("saved");
        // Reset to idle after showing saved status
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Failed to save note:", error);
        setSaveStatus("error");
        // Reset to idle after showing error
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    1500
  );

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave(newTitle, currentContent);
  };

  // Handle content update from editor
  const handleEditorUpdate = React.useCallback(
    (editor: EditorInstance) => {
      const json = editor.getJSON();
      setCurrentContent(json);
      debouncedSave(title, json);
    },
    [title, debouncedSave]
  );

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-4 border-b px-6 py-4">
        <SidebarTrigger />
        {/* Title input */}
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="w-full border-none bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground"
          />
        </div>
        <DeleteAlert
          noteId={noteId}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
            >
              <IconTrash className="h-5 w-5" />
            </Button>
          }
        />
      </div>
      {/* Novel editor */}
      <div className="flex-1 overflow-auto px-6 py-4 relative">
        {/* Save status indicator */}
        <div className="absolute top-4 right-6 flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === "saving" && (
            <>
              <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Saved</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>Failed to save</span>
            </>
          )}
        </div>
        <EditorRoot key={noteId}>
          <EditorContent
            immediatelyRender={false}
            extensions={extensions}
            initialContent={editorInitialContent}
            onUpdate={({ editor }) => handleEditorUpdate(editor)}
            className="relative w-full"
            editorProps={{
              handleDOMEvents: {
                keydown: (_view, event) => handleCommandNavigation(event),
              },
              attributes: {
                class:
                  "prose min-h-[calc(100vh-11rem)] prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
              },
            }}
          >
            <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
              <EditorCommandEmpty className="px-2 text-muted-foreground">
                No results
              </EditorCommandEmpty>
              <EditorCommandList>
                {suggestionItems.map((item) => (
                  <EditorCommandItem
                    value={item.title}
                    onCommand={(val) => item?.command?.(val)}
                    className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                    key={item.title}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </EditorCommandItem>
                ))}
              </EditorCommandList>
            </EditorCommand>
          </EditorContent>
        </EditorRoot>
      </div>
    </div>
  );
}

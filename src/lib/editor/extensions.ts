import {
  TiptapLink,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
} from "novel";

export const defaultExtensions = [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: {
        class: "list-disc list-outside leading-3 -mt-2",
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal list-outside leading-3 -mt-2",
      },
    },
    listItem: {
      HTMLAttributes: {
        class: "leading-normal -mb-2",
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: "border-l-4 border-primary",
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class:
          "rounded-md bg-muted text-muted-foreground border p-5 font-mono font-medium",
      },
    },
    code: {
      HTMLAttributes: {
        class:
          "rounded-md bg-muted  px-1.5 py-1 font-mono font-medium",
        spellcheck: "false",
      },
    },
    horizontalRule: false,
    dropcursor: {
      color: "#DBEAFE",
      width: 4,
    },
    gapcursor: false,
  }),
  HorizontalRule.extend({
    addInputRules() {
      return [
        {
          find: /^(?:---|—-|___\s|\*\*\*\s)$/,
          handler: ({ state, range }) => {
            const attributes = {};

            const { tr } = state;
            const start = range.from;
            const end = range.to;

            tr.insert(start - 1, this.type.create(attributes)).delete(
              tr.mapping.map(start),
              tr.mapping.map(end)
            );
          },
        },
      ];
    },
  }).configure({
    HTMLAttributes: {
      class: "mt-4 mb-6 border-t border-muted-foreground",
    },
  }),
  TiptapLink.configure({
    HTMLAttributes: {
      class:
        "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    },
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return "Press '/' for commands, or start typing...";
    },
    includeChildren: true,
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: "not-prose pl-2 ",
    },
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: "flex gap-2 items-start my-4",
    },
    nested: true,
  }),
];


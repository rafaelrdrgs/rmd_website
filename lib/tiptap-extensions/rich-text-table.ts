import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    richTextTable: {
      insertRichTextTable: (options?: {
        rows?: number;
        cols?: number;
        withHeaderRow?: boolean;
      }) => ReturnType;
      toggleCurrentRowHeader: () => ReturnType;
    };
  }
}

export const RichTextTable = Table.extend({
  name: 'table',

  addCommands() {
    return {
      ...this.parent?.(),
      insertRichTextTable:
        ({ rows = 3, cols = 3, withHeaderRow = true } = {}) =>
          ({ editor }) => {
            return editor.commands.insertTable({ rows, cols, withHeaderRow });
          },
      toggleCurrentRowHeader:
        () =>
          ({ state, dispatch }) => {
            const { selection, schema } = state;
            const $pos = selection.$from;

            const headerType = schema.nodes.tableHeader;
            const cellType = schema.nodes.tableCell;
            if (!headerType || !cellType) return false;

            // Walk up from cursor to find the tableRow node
            let rowDepth: number | null = null;
            for (let d = $pos.depth; d > 0; d--) {
              if ($pos.node(d).type.name === 'tableRow') {
                rowDepth = d;
                break;
              }
            }
            if (rowDepth === null) return false;

            const row = $pos.node(rowDepth);
            const rowStart = $pos.start(rowDepth);

            // Determine target type: if any cell is tableCell, convert all to tableHeader; otherwise convert to tableCell
            let hasRegularCell = false;
            row.forEach((cell) => {
              if (cell.type === cellType) hasRegularCell = true;
            });
            const targetType = hasRegularCell ? headerType : cellType;

            if (!dispatch) return true;

            const tr = state.tr;
            let offset = 0;
            row.forEach((cell, cellOffset) => {
              if (cell.type !== targetType) {
                const pos = rowStart + offset;
                tr.setNodeMarkup(pos, targetType, cell.attrs);
              }
              offset += cell.nodeSize;
            });

            dispatch(tr);
            return true;
          },
    };
  },
});

export const RichTextTableRow = TableRow.extend({
  name: 'tableRow',
});

export const RichTextTableCell = TableCell.extend({
  name: 'tableCell',
});

export const RichTextTableHeader = TableHeader.extend({
  name: 'tableHeader',
});

import { useState } from "react";
import type { AdminMenuNode } from "../menuTypes";
import type { MovePosition } from "@/api/adminMenu";

interface DropZoneInfo {
  nodeId: number;
  position: MovePosition;
}

interface Props {
  node: AdminMenuNode;
  depth: number;
  selectedId: number | null;
  draggingId: number | null;
  onSelect: (node: AdminMenuNode) => void;
  onAddChild: (node: AdminMenuNode) => void;
  onDelete: (node: AdminMenuNode) => void;
  onDragStart: (node: AdminMenuNode) => void;
  onDragEnd: () => void;
  onDrop: (info: DropZoneInfo) => void;
}

export default function MenuTreeNode({
  node,
  depth,
  selectedId,
  draggingId,
  onSelect,
  onAddChild,
  onDelete,
  onDragStart,
  onDragEnd,
  onDrop,
}: Props) {
  const [expanded, setExpanded] = useState(depth < 1);
  const [hoverZone, setHoverZone] = useState<MovePosition | null>(null);
  const hasChildren = node.children.length > 0;
  const isDraggingSelf = draggingId === node.id;

  function zoneFromEvent(e: React.DragEvent): MovePosition {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    return ratio < 0.25 ? "before" : ratio > 0.75 ? "after" : "child";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (draggingId === node.id) return;
    setHoverZone(zoneFromEvent(e));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    // Computed fresh here rather than read from `hoverZone` state — that
    // state is set by handleDragOver but React may not have flushed the
    // update yet by the time the browser fires `drop` right after a final
    // `dragover` (no re-render guaranteed to happen in between), which
    // would silently no-op the drop on a stale/null closure value.
    if (draggingId !== node.id) {
      onDrop({ nodeId: node.id, position: zoneFromEvent(e) });
    }
    setHoverZone(null);
  }

  return (
    <div>
      <div
        draggable
        onDragStart={() => onDragStart(node)}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={() => setHoverZone(null)}
        onDrop={handleDrop}
        style={{ paddingLeft: depth * 20 }}
        className={`group flex items-center gap-1.5 py-1.5 pr-2 rounded-md cursor-grab select-none border-2 ${
          selectedId === node.id ? "bg-primary-50 border-primary-300" : "border-transparent hover:bg-background-100"
        } ${isDraggingSelf ? "opacity-40" : ""} ${
          hoverZone === "before" ? "border-t-primary-500" : ""
        } ${hoverZone === "after" ? "border-b-primary-500" : ""} ${hoverZone === "child" ? "!bg-primary-100" : ""}`}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`w-5 h-5 flex items-center justify-center text-foreground-400 cursor-pointer ${!hasChildren && "invisible"}`}
        >
          <i className={expanded ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"} />
        </button>

        <span
          onClick={() => onSelect(node)}
          className={`flex-1 text-sm truncate cursor-pointer ${node.status === 1 && node.active === 1 && !node.disabled ? "text-foreground-800" : "text-foreground-400 italic"}`}
        >
          {node.titleUz || <span className="text-foreground-300">(nomsiz)</span>}
        </span>

        <span className="text-[11px] text-foreground-400 font-mono">#{node.id}</span>

        <div className="hidden group-hover:flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddChild(node)}
            title="Ichiga qo'shish"
            className="w-6 h-6 flex items-center justify-center rounded text-foreground-500 hover:bg-background-200 hover:text-primary-600 cursor-pointer"
          >
            <i className="ri-add-line text-sm" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(node)}
            title="O'chirish"
            className="w-6 h-6 flex items-center justify-center rounded text-foreground-500 hover:bg-accent-50 hover:text-accent-600 cursor-pointer"
          >
            <i className="ri-delete-bin-line text-sm" />
          </button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <MenuTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              draggingId={draggingId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

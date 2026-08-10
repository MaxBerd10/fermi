import { useEffect, useRef, useState } from "react";
import { getMenuTree, createMenuNode, updateMenuNode, deleteMenuNode, moveMenuNode } from "@/api/adminMenu";
import type { AdminMenuNode } from "@/admin/menuTypes";
import type { MenuNodeInput, MovePosition } from "@/api/adminMenu";
import MenuTreeNode from "@/admin/components/MenuTreeNode";
import MenuNodeEditor from "@/admin/components/MenuNodeEditor";

function findNode(nodes: AdminMenuNode[], id: number): AdminMenuNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

export default function MenuTreePage() {
  const [tree, setTree] = useState<AdminMenuNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  // The drop decision reads this ref (updated synchronously in onDragStart),
  // not the `draggingId` state above — state is only for the dimming visual.
  // A native drag always has a real dragover in between (the user physically
  // moves the mouse), which is enough for React to flush state in practice,
  // but the ref removes any dependency on that timing assumption entirely.
  const draggingIdRef = useRef<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await getMenuTree();
      setTree(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selectedNode = selectedId != null ? findNode(tree, selectedId) : null;

  async function onAddRoot() {
    const created = await createMenuNode({
      parentId: null,
      title_uz: "Yangi bo'lim",
      title_ru: "Новый раздел",
      title_en: "New section",
      url_type: "other",
      url_value: "#",
      status: 1,
      active: 1,
      disabled: 0,
    });
    await load();
    setSelectedId(created.id);
  }

  async function onAddChild(parent: AdminMenuNode) {
    const created = await createMenuNode({
      parentId: parent.id,
      title_uz: "Yangi element",
      title_ru: "Новый элемент",
      title_en: "New item",
      url_type: "other",
      url_value: "#",
      status: 1,
      active: 1,
      disabled: 0,
    });
    await load();
    setSelectedId(created.id);
  }

  async function onDelete(node: AdminMenuNode) {
    const childWarning = node.children.length > 0 ? ` (va uning ${node.children.length} ta ichki elementi)` : "";
    if (!window.confirm(`"${node.titleUz}"${childWarning}ni o'chirishni tasdiqlaysizmi?`)) return;
    await deleteMenuNode(node.id);
    if (selectedId === node.id) setSelectedId(null);
    await load();
  }

  async function onSave(input: MenuNodeInput) {
    if (!selectedNode) return;
    await updateMenuNode(selectedNode.id, input);
    await load();
  }

  async function onDrop(info: { nodeId: number; position: MovePosition }) {
    const sourceId = draggingIdRef.current;
    if (sourceId == null) return;
    setError("");
    try {
      await moveMenuNode(sourceId, info.nodeId, info.position);
      await load();
    } catch {
      setError("Ko'chirishda xatolik yuz berdi (masalan, elementni o'zining ichiga ko'chirib bo'lmaydi).");
    }
    draggingIdRef.current = null;
    setDraggingId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground-950">Menyu daraxti</h1>
          <p className="text-sm text-foreground-500 mt-1">Elementlarni sudrab tartibini o'zgartiring: yuqori/pastki chetiga tashlansa — yonma-yon, o'rtasiga tashlansa — ichiga joylashadi.</p>
        </div>
        <button onClick={onAddRoot} className="h-10 px-4 rounded-md bg-primary-500 hover:bg-primary-600 text-background-50 text-sm font-semibold flex items-center gap-2 cursor-pointer shrink-0">
          <i className="ri-add-line" /> Yangi bo'lim
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-md bg-accent-50 border border-accent-200 text-sm text-accent-800">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background-50 border border-background-200 rounded-lg p-3">
          {loading ? (
            <div className="py-16 flex justify-center">
              <i className="ri-loader-4-line w-8 h-8 flex items-center justify-center animate-spin text-primary-500 text-3xl" />
            </div>
          ) : (
            tree.map((node) => (
              <MenuTreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedId}
                draggingId={draggingId}
                onSelect={(n) => setSelectedId(n.id)}
                onAddChild={onAddChild}
                onDelete={onDelete}
                onDragStart={(n) => {
                  draggingIdRef.current = n.id;
                  setDraggingId(n.id);
                }}
                onDragEnd={() => {
                  draggingIdRef.current = null;
                  setDraggingId(null);
                }}
                onDrop={onDrop}
              />
            ))
          )}
        </div>

        <div>
          {selectedNode ? (
            <MenuNodeEditor node={selectedNode} onSave={onSave} onClose={() => setSelectedId(null)} />
          ) : (
            <div className="bg-background-50 border border-background-200 rounded-lg p-5 text-sm text-foreground-500 text-center">
              Tahrirlash uchun chapdan biror elementni tanlang.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { MovableArea, MovableView, View } from '@tarojs/components';
import type { ITouchEvent } from '@tarojs/components';
import type { TripItem } from '../types';

/**
 * 长按拖拽排序（架构文档 2.6 节已确认）：用小程序原生 movable-view 实现，
 * 免费、平台自带能力，不接第三方手势库（细节见架构文档第9节成本估算）。
 *
 * 算法：每一项固定高度 ITEM_HEIGHT，movable-view 的 y 用 index * ITEM_HEIGHT 摆位；
 * 拖拽过程中用 onChange 拿到实时 y，换算成"当前应该排第几"，超过阈值就跟别的项互换位置，
 * 松手（onTouchEnd）后把最终顺序一次性提交给后端（PATCH /items/reorder）。
 * ⚠️ 拖拽的手感（阻尼、吸附速度）在真机/开发者工具里跑起来之后大概率要再调，
 * 这里先保证算法逻辑是对的。
 */
const ITEM_HEIGHT = 96; // px，需要跟 index.scss 里 .item 的实际高度保持一致

export interface DraggableItemListProps {
  items: TripItem[];
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: TripItem, dragHandle: React.ReactNode) => React.ReactNode;
}

export default function DraggableItemList({ items, onReorder, renderItem }: DraggableItemListProps) {
  const [order, setOrder] = useState<string[]>(() => items.map((i) => i.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // items 从服务端刷新后同步一次顺序（比如刚 addTripItem 完）
  const orderedIds = useMemo(() => {
    const knownIds = new Set(items.map((i) => i.id));
    const stillValid = order.filter((id) => knownIds.has(id));
    const missing = items.map((i) => i.id).filter((id) => !stillValid.includes(id));
    return [...stillValid, ...missing];
  }, [items, order]);

  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  function handleChange(id: string, y: number) {
    const currentIndex = orderedIds.indexOf(id);
    const targetIndex = Math.max(0, Math.min(orderedIds.length - 1, Math.round(y / ITEM_HEIGHT)));
    if (targetIndex === currentIndex) return;

    const next = [...orderedIds];
    next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, id);
    setOrder(next);
  }

  function handleTouchEnd() {
    if (!draggingId) return;
    setDraggingId(null);
    onReorder(orderedIds);
  }

  return (
    <MovableArea
      style={{ height: `${orderedIds.length * ITEM_HEIGHT}px`, width: '100%', position: 'relative' }}
    >
      {orderedIds.map((id, index) => {
        const item = itemMap.get(id);
        if (!item) return null;
        const isDragging = draggingId === id;

        const dragHandle = (
          <View
            className="drag-handle"
            onTouchStart={() => setDraggingId(id)}
            onTouchEnd={handleTouchEnd}
          >
            <View className="dot" />
            <View className="dot" />
            <View className="dot" />
            <View className="dot" />
            <View className="dot" />
            <View className="dot" />
          </View>
        );

        return (
          <MovableView
            key={id}
            direction="vertical"
            y={index * ITEM_HEIGHT}
            damping={40}
            friction={2}
            style={{
              width: '100%',
              height: `${ITEM_HEIGHT}px`,
              zIndex: isDragging ? 10 : 1,
            }}
            onChange={(e: ITouchEvent & { detail: { y: number; source: string } }) => {
              if (e.detail.source !== 'touch') return; // 只处理用户手指拖拽，忽略程序设的 y
              handleChange(id, e.detail.y);
            }}
            onTouchEnd={handleTouchEnd}
          >
            {renderItem(item, dragHandle)}
          </MovableView>
        );
      })}
    </MovableArea>
  );
}

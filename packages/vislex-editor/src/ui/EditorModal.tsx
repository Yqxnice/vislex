/**
 * 编辑器统一模态壳：基于 @vislex/ui Dialog，视觉对齐旧版自实现模态。
 * Esc / 遮罩点击关闭由 Base UI 内置处理；Ctrl+Enter 保存等快捷键由各弹窗自行监听。
 */
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from '@vislex/ui';
import type { ReactNode } from 'react';

import { dialogPopup, modalFooter, modalHeader, modalTitle } from './classes.css';

export interface EditorModalProps {
  open: boolean;
  /** 关闭回调（Esc、遮罩点击、内置关闭按钮统一走这里） */
  onClose: () => void;
  title: ReactNode;
  /** 弹窗最大宽度（px），默认 880；行内 style 设置，无优先级问题 */
  width?: number;
  children: ReactNode;
  /** 底部按钮区内容（取消/确定等），不传则不渲染 footer */
  footer?: ReactNode;
}

export function EditorModal({
  open,
  onClose,
  title,
  width = 880,
  children,
  footer,
}: EditorModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogPopup
        className={dialogPopup}
        style={{ width: '100%', maxWidth: `min(${width}px, 100%)` }}
      >
        <DialogHeader className={modalHeader}>
          <DialogTitle className={modalTitle}>{title}</DialogTitle>
        </DialogHeader>
        {children}
        {footer ? <DialogFooter className={modalFooter}>{footer}</DialogFooter> : null}
      </DialogPopup>
    </Dialog>
  );
}

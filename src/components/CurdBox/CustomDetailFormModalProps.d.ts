import { DetailFormModalProps } from '../DetailFormModal/index';

export interface CustomDetailFormModalProps extends DetailFormModalProps {
  modalConfig: {
    title?: never;
    visible?: never;
    onClose?: never;
    onOk?: never;
  };
  itemsConfig: never;
  loading?: never;
}

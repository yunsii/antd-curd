import { DetailFormDrawerProps } from '../DetailFormDrawer/index';

export interface CustomDetailFormDrawerProps extends DetailFormDrawerProps {
  drawerConfig: {
    title?: never;
    visible?: never;
    onClose?: never;
  };
  onOk?: never;
  itemsConfig: never;
  loading?: never;
}
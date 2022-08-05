export type EditorDialogData<T> = {
	operation: 'edit' | 'create';
	data?: T;
};

export type EditorDialogProps<T> = EditorDialogData<T> & {
    open: boolean;
	onSubmit: (data: T) => void;
	onClose: () => void;
};
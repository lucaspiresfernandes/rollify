export type EditorDialogOperation = 'create' | 'update';

export type EditorDialogData<T> = {
	data?: T;
	operation: EditorDialogOperation;
};

export type EditorDialogProps<T> = {
	title: string;
	open: boolean;
	onSubmit: (data: T) => void;
	onClose: () => void;
	data?: T;
};

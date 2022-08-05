export type EditorDialogData<T> = {
	data?: T;
	operation: 'create' | 'update';
};

export type EditorDialogProps<T> = {
	title: string;
	open: boolean;
	onSubmit: (data: T) => void;
	onClose: () => void;
	data?: T;
};

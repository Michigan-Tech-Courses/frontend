const saveAs = (uri: string, filename: string) => {
	const link = document.createElement('a');
	link.href = uri.toString();
	link.download = filename;
	document.body.append(link);
	link.click();
	link.remove();
};

export default saveAs;

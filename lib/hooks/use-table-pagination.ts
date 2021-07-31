import {useState, useCallback, useEffect} from 'react';
import {usePrevious} from '@chakra-ui/react';

const TABLE_LENGTH_OPTIONS = [10, 20, 50];

const useTablePagination = ({len, onPageChange}: {len: number; onPageChange: () => void}) => {
	const [page, setPage] = useState(0);
	const previousPage = usePrevious(page);
	const [pageSize, setPageSize] = useState(10);

	const numberOfPages = Math.ceil(len / pageSize);

	const handlePageSizeChange = useCallback((newPageSize: number) => {
		const newNumberOfPages = Math.ceil(len / newPageSize);
		setPage(p => Math.floor((p / numberOfPages) * newNumberOfPages));
		setPageSize(newPageSize);
	}, [numberOfPages]);

	const startAt = page * pageSize;
	const endAt = (page + 1) * pageSize;

	useEffect(() => {
		if (typeof previousPage === 'number' && previousPage !== page) {
			onPageChange();
		}
	}, [page, previousPage, onPageChange]);

	return {startAt, endAt, setPage, handlePageSizeChange, page, numberOfPages, pageSize, availableSizes: TABLE_LENGTH_OPTIONS};
};

export default useTablePagination;

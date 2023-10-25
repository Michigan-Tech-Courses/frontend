import React, {useState, useEffect} from 'react';
import {usePrevious} from '@chakra-ui/react';

type ScrollTopDetectorProps = {
	onTop: () => void;
	onScrolled: () => void;
	children: React.ReactElement;
};

const ScrollTopDetector = (props: ScrollTopDetectorProps) => {
	const [scrollTop, setScrollTop] = useState(0);
	const previousScrollTop = usePrevious(scrollTop);

	const {onScrolled, onTop} = props;
	useEffect(() => {
		if (typeof previousScrollTop === 'number') {
			if (previousScrollTop === 0 && scrollTop > 0) {
				onScrolled();
			} else if (previousScrollTop !== 0 && scrollTop === 0) {
				onTop();
			}
		}
	}, [previousScrollTop, scrollTop, onScrolled, onTop]);

	const children = React.Children.map(props.children, child => React.cloneElement(child, {
		onScroll(event: React.UIEvent<HTMLDivElement>) {
			setScrollTop((event.target as unknown as {scrollTop: number}).scrollTop);
		},
	}));

	return (
		<>
			{children}
		</>
	);
};

export default ScrollTopDetector;

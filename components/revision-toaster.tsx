import React, {useRef} from 'react';
import {useToast} from '@chakra-ui/toast';
import {Box, Button} from '@chakra-ui/react';
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle
} from '@chakra-ui/alert';
import useRevalidation from '../lib/use-revalidation';

const RevisionToaster = () => {
	const toast = useToast();
	const toastRef = useRef<React.ReactText | undefined>();

	useRevalidation(true, async () => {
		if (toastRef.current || process.env.NEXT_PUBLIC_LIGHTHOUSE) {
			return;
		}

		try {
			const revision = await (await fetch('/api/revision')).text();

			if (revision !== process.env.NEXT_PUBLIC_GIT_REVISION) {
				toastRef.current = toast({
					duration: null,
					render: () => (
						<Alert
							status="info"
							variant="solid"
							alignItems="start"
							borderRadius="md"
							boxShadow="lg"
							paddingRight={8}
							textAlign="left"
							width="auto"
						>
							<AlertIcon />
							<Box flex="1">
								<AlertTitle>Upgrade Available</AlertTitle>
								<AlertDescription display="block">
									There's a new version available. <Button variant="link" as="a" href="." colorScheme="yellow">Refresh</Button> to upgrade.
								</AlertDescription>
							</Box>
						</Alert>
					)
				});
			}
		} catch {}
	}, 30 * 1000);

	return null;
};

export default RevisionToaster;

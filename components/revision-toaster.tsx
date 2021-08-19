import React, {useRef, useState} from 'react';
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Box,
	Button,
	useToast
} from '@chakra-ui/react';
import useRevalidation from '../lib/hooks/use-revalidation';

const RevisionToaster = () => {
	const [loadDate] = useState(new Date());
	const toast = useToast();
	const toastRef = useRef<React.ReactText | undefined>();

	useRevalidation(true, async () => {
		// Prevents a popup appearing while a new service worker is being installed
		const isBefore10Seconds = Date.now() - loadDate.getTime() < 10 * 1000;
		if (toastRef.current || process.env.NEXT_PUBLIC_LIGHTHOUSE || isBefore10Seconds) {
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
							<AlertIcon/>
							<Box flex="1">
								<AlertTitle>Upgrade Available</AlertTitle>
								<AlertDescription display="block">
									There's a new version available.

									<Button
										variant="link"
										colorScheme="yellow"
										onClick={() => {
											window.location.reload();
										}}
									>
										Refresh
									</Button>

									to upgrade.
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

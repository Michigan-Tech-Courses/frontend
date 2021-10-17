import React, {useEffect, useRef} from 'react';
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Box,
	Button,
	useToast,
} from '@chakra-ui/react';

const RegisterPWA = () => {
	const toast = useToast();
	const toastRef = useRef<React.ReactText | undefined>();

	useEffect(() => {
		if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
			const wb = window.workbox;

			// A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
			// NOTE: MUST set skipWaiting to false in next.config.js pwa object
			// https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
			const promptNewVersionAvailable = () => {
				if (!toastRef.current) {
					toastRef.current = toast({
						duration: null,
						position: 'bottom-right',
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
										{' '}
										<Button
											variant="link"
											colorScheme="yellow"
											onClick={() => {
												wb.addEventListener('controlling', () => {
													window.location.reload();
												});

												// Send a message to the waiting service worker, instructing it to activate.
												wb.messageSkipWaiting();
											}}
										>
											Refresh
										</Button>
										{' '}
										to upgrade.
									</AlertDescription>
								</Box>
							</Alert>
						),
					});
				}
			};

			wb.addEventListener('waiting', promptNewVersionAvailable);

			void wb.register();
		}
	}, [toast]);

	return null;
};

export default RegisterPWA;

import React, {useEffect, useState} from 'react';
import {
	Container,
	Box,
	VStack,
	HStack,
	Input,
	Text,
	Button,
	Heading,
	UnorderedList,
	ListItem,
	Fade,
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from '@chakra-ui/react';
import useStore from 'src/lib/state/context';
import {ISectionFromAPI} from 'src/lib/api-types';
import {NextSeo} from 'next-seo';

const N_INPUTS = 10;

const RegistrationScriptPage = () => {
	const {apiState} = useStore();
	const [registeredSections, setRegisteredSections] = useState<ISectionFromAPI[]>([]);
	const [crnsNotFound, setCrnsNotFound] = useState<Array<ISectionFromAPI['crn']>>([]);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		const data = new FormData(event.target as HTMLFormElement);

		let crns: string[] = [];
		for (const value of data.values()) {
			if (value !== '') {
				crns.push(value as string);
			}
		}

		const sections = [];
		for (const section of apiState.sections) {
			if (crns.includes(section.crn)) {
				crns = crns.filter(c => c !== section.crn);
				sections.push(section);
			}

			if (crns.length === 0) {
				break;
			}
		}

		setCrnsNotFound(crns);
		setRegisteredSections(sections);
	};

	useEffect(() => {
		apiState.setRecurringFetchEndpoints(['courses', 'sections']);

		return () => {
			apiState.setRecurringFetchEndpoints([]);
		};
	}, [apiState]);

	return (
		<Container maxW="container.lg">
			<NextSeo
				title="MTU Courses | Test Registration Script"
				description="Test your registration script on a sample form."
			/>

			<VStack spacing={8} align="flex-start">
				<Heading size="xl">⌨️ Test Registration Macro</Heading>

				<Box>
					<Text mb={4}>Place your cursor in the first input below, then activate your macro to test it (make sure the correct semester is selected above):</Text>

					<HStack spacing={4} as="form" onSubmit={handleSubmit}>
						{
							Array.from({length: N_INPUTS}).map((_, i) => (
								// eslint-disable-next-line react/no-array-index-key
								<Input key={i} size="sm" name={i.toString()}/>
							))
						}

						<Button type="submit" display="none"/>
					</HStack>
				</Box>

				{
					crnsNotFound.length > 0 && (
						<Alert status="error" rounded="md">
							<AlertIcon/>
							<AlertTitle>CRNS not found:</AlertTitle>
							<AlertDescription>
								Some CRNS could not be found for this semester: {crnsNotFound.join(', ')}.
							</AlertDescription>
						</Alert>
					)
				}

				<Fade in={registeredSections.length > 0}>
					<Heading size="lg" mb={3}>Registered Sections:</Heading>

					<UnorderedList>
						{
							registeredSections.map(section => {
								const course = apiState.courseById.get(section.courseId);

								if (course) {
									return (
										<ListItem key={section.id}>
											{course.title}
											{' '}
											{section.section}
										</ListItem>
									);
								}

								return null;
							})
						}
					</UnorderedList>
				</Fade>
			</VStack>
		</Container>
	);
};

export default RegistrationScriptPage;

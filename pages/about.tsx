import {Container, Heading, ListItem, Text, UnorderedList, VStack} from '@chakra-ui/react';
import {NextSeo} from 'next-seo';
import React from 'react';
import WrappedLink from '../components/link';

const AboutPage = () => (
	<Container mb={10}>
		<NextSeo
			title="MTU Courses | About"
			description="About Courses at Michigan Tech"
		/>

		<Heading size="xl" mb={6}>About</Heading>

		<VStack align="flex-start" spacing={6}>
			<VStack align="flex-start">
				<Text as="span">
					👋 Hi! I'm <WrappedLink href="https://maxisom.me" display="inline-block">Max</WrappedLink>, a student at Michigan Tech.
				</Text>

				<Text as="span">
					I made this tool because Banweb can be a pain to use when you're just trying to take a first pass at figuring out what courses to take. This also makes information available that's not accessible via Banweb as well, like the pass, fail, drop, and class size data.
				</Text>

				<Text as="span">
					It currently costs ~$9 / month to host this, so if you found it useful feel free to <WrappedLink href="https://github.com/sponsors/codetheweb/" display="inline-block">sponsor me</WrappedLink> or <WrappedLink href="https://www.buymeacoffee.com/maxisom" display="inline-block">buy me a coffee</WrappedLink>.
				</Text>
			</VStack>

			<VStack align="flex-start">
				<Heading size="md">🤔 Planned improvements</Heading>

				<UnorderedList stylePosition="inside">
					<ListItem>📱 Better mobile view</ListItem>
					<ListItem>🧺 Add "baskets" that can be used to plan out a semester by adding sections and checking the overall schedule</ListItem>
				</UnorderedList>
			</VStack>

			<VStack align="flex-start">
				<Heading size="md">📮 Contact</Heading>

				<Text as="span">
					Ran into a nasty bug? Or have a cool idea that you'd like to see implemented?
				</Text>

				<Text as="span">
					If you have a GitHub account, feel free to <WrappedLink href="https://github.com/Michigan-Tech-Courses/frontend/issues" display="inline-block">make an issue</WrappedLink>. Otherwise, you can <WrappedLink href="mailto:hi@maxisom.me" display="inline-block">email me directly</WrappedLink>.
				</Text>
			</VStack>

			<VStack align="flex-start">
				<Heading size="md">❤️ Open source</Heading>

				<Text as="span">
					We're completely <WrappedLink href="https://github.com/Michigan-Tech-Courses" display="inline-block">open-source</WrappedLink>!
				</Text>

				<Text as="span">
					Hopefully some of the above repositories are useful for your own projects.
				</Text>
			</VStack>

			<VStack align="flex-start">
				<Heading size="md">🧱 Tech stack</Heading>

				<Text as="span">
					I'm currently using:
				</Text>

				<UnorderedList stylePosition="inside" lineHeight="2">
					<ListItem>
						Frontend:

						<UnorderedList lineHeight="2">
							<ListItem>React</ListItem>
							<ListItem>
								<WrappedLink href="https://nextjs.org/" display="inline-block">Next.JS</WrappedLink>
							</ListItem>
							<ListItem>
								<WrappedLink href="https://chakra-ui.com/" display="inline-block">Chakra UI</WrappedLink>
							</ListItem>
							<ListItem>
								<WrappedLink href="https://lunrjs.com/" display="inline-block">Lunr</WrappedLink>
							</ListItem>
							<ListItem>
								<WrappedLink href="https://mobx.js.org/README.html" display="inline-block">MobX</WrappedLink>
							</ListItem>
						</UnorderedList>
					</ListItem>

					<ListItem>
						Backend:

						<UnorderedList lineHeight="2">
							<ListItem>
								<WrappedLink href="https://nestjs.com/" display="inline-block">NestJS</WrappedLink>
							</ListItem>
							<ListItem>
								Prisma
							</ListItem>
							<ListItem>
								<WrappedLink href="https://github.com/OptimalBits/bull" display="inline-block">Bull</WrappedLink>
							</ListItem>
							<ListItem>Redis</ListItem>
							<ListItem>PostgreSQL</ListItem>
							<ListItem>Kubernetes</ListItem>
							<ListItem>
								<WrappedLink href="http://thumbor.org/" display="inline-block">Thumbor</WrappedLink>
							</ListItem>
						</UnorderedList>
					</ListItem>

					<ListItem>
						Hosting / third party:

						<UnorderedList lineHeight="2">
							<ListItem>
								<WrappedLink href="https://vercel.com" display="inline-block">Vercel</WrappedLink>
							</ListItem>
							<ListItem>
								<WrappedLink href="https://www.maxkvm.com/" display="inline-block">MaxKVM</WrappedLink>
							</ListItem>
							<ListItem>
								<WrappedLink href="https://www.datadoghq.com/" display="inline-block">Datadog</WrappedLink>
							</ListItem>
						</UnorderedList>
					</ListItem>
				</UnorderedList>
			</VStack>

			<VStack align="flex-start">
				<Heading size="md">↔️ API</Heading>

				<Text as="span">
					<WrappedLink href="https://api.michigantechcourses.com/docs/static/index.html" display="inline-block">The API</WrappedLink> is open and free to use, but please don't abuse it.
				</Text>
			</VStack>

			<VStack align="flex-start" mb={12}>
				<Heading size="md">Disclaimer</Heading>

				<Text as="span">
					Although every effort is made to keep the information listed here up-to-date, I make no guarantees about the correctness of the information. Please check Banweb for the latest information.
				</Text>

				<Text as="span">
					That being said, the most critical information here (course and section data) should be at most 10 minutes out of date at any given moment.
				</Text>
			</VStack>
		</VStack>
	</Container>
);

export default AboutPage;

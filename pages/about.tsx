import {Container, Heading, ListItem, Text, UnorderedList, VStack} from '@chakra-ui/react';
import WrappedLink from '../components/link';

const AboutPage = () => (
	<Container>
		<Heading size="xl" mb={6}>About</Heading>

		<VStack align="flex-start" spacing={6}>
			<VStack align="flex-start">
				<Text as="p">
          👋 Hi! I'm <WrappedLink href="https://maxisom.me" display="inline-block">Max</WrappedLink>, a student at Michigan Tech.
				</Text>

				<Text as="p">
          I made this tool because Banweb can be a pain to use when you're just trying to take a first pass at figuring out what courses to take. This also makes information available that's not accessible via Banweb as well, like the pass, fail, drop, and class size data.
				</Text>

				<Text as="p">
          It currently costs ~$6 / month to host this, so if you found it useful feel free to <WrappedLink href="https://github.com/sponsors/codetheweb/" display="inline-block">sponsor me</WrappedLink> or <WrappedLink href="https://www.buymeacoffee.com/maxisom" display="inline-block">buy me a coffee</WrappedLink>.
				</Text>
			</VStack>

			<VStack align="flex-start">
				<Heading size="md">Planned improvements</Heading>

				<UnorderedList stylePosition="inside">
					<ListItem>📱 Better mobile view</ListItem>
					<ListItem>🔗 Ability to share link to specific course / section</ListItem>
					<ListItem>🧺 Add "baskets" that can be used to plan out a semester by adding sections and checking the overall schedule</ListItem>
				</UnorderedList>
			</VStack>

			<VStack align="flex-start">
				<Heading size="md">📮 Contact</Heading>

				<Text as="p">
          Ran into a nasty bug? Or have a cool idea that you'd like to see implimented?
				</Text>

				<Text as="p">
          If you have a GitHub account, feel free to <WrappedLink href="https://github.com/Michigan-Tech-Courses/frontend/issues" display="inline-block">make an issue</WrappedLink>. Otherwise, you can <WrappedLink href="mailto:hi@maxisom.me" display="inline-block">email me directly</WrappedLink>.
				</Text>
			</VStack>

			<VStack align="flex-start">
				<Heading size="md">❤️ Open source</Heading>

				<Text as="p">
          You can check out all our repositories <WrappedLink href="https://github.com/Michigan-Tech-Courses" display="inline-block">here</WrappedLink>.
				</Text>

				<Text as="p">
          Hopefully some of them are useful for your own projects.
				</Text>
			</VStack>

			<VStack align="flex-start">
				<Heading size="md">Disclaimer</Heading>

				<Text as="p">
          Although every effort is made to keep the information listed here up-to-date, I make no guarantees about the correctness of the information. Please check Banweb for the latest information.
				</Text>

				<Text as="p">
          That being said, the most critical information here (course and section data) should be at most 5 minutes out of date at any given moment.
				</Text>
			</VStack>
		</VStack>

    contact
	</Container>
);

export default AboutPage;

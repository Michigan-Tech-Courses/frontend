import React from 'react';
import Image from 'next/image';
import {
	Box,
	Container,
	Heading,
	HStack,
	ListItem,
	Text,
	UnorderedList,
	VStack,
} from '@chakra-ui/react';
import {NextSeo} from 'next-seo';
import WrappedLink from 'src/components/link';
import GrumpyGif from 'public/images/grumpy.gif';
import LightningGif from 'public/images/lightning.gif';
import {observer} from 'mobx-react-lite';

const AboutPage = observer(() => (
	<Container mb={10}>
		<NextSeo
			title='MTU Courses | About'
			description='About Courses at Michigan Tech'
		/>

		<Heading size='xl' mb={6}>
      About
		</Heading>

		<VStack align='flex-start' spacing={10}>
			<VStack align='flex-start'>
				<Text as='span'>
          👋 Hi! I'm{' '}
					<WrappedLink href='https://maxisom.me' display='inline-block'>
            Max
					</WrappedLink>
          , a former student of Michigan Tech.
				</Text>

				<Text as='span'>
          I made this tool because Banweb is... well, it gets the job done. But
          whether you're taking a first pass at figuring out courses or planning
          out future semesters, using Banweb always feels more painful than
          necessary (why does it take so many clicks to navigate between course
          descriptions?).
				</Text>

				<Text as='div'>
          That's where Michigan Tech Courses comes in. How does
					<UnorderedList lineHeight='2'>
						<ListItem>⚡️ instant search</ListItem>
						<ListItem>
              📅 integrated semester planning (with weekly / monthly schedule
              preview)
						</ListItem>
						<ListItem>📈 pass / fail / drop / class size stats</ListItem>
						<ListItem>🧑‍🏫 integrated instructor ratings</ListItem>
						<ListItem>↔️ searchable transfer courses (!)</ListItem>
					</UnorderedList>
          sound?
				</Text>

				<Text>In other words:</Text>

				<HStack align='flex-start' spacing={4} alignSelf='center'>
					<VStack>
						<Text fontWeight='bold' mb={2}>
              Banweb
						</Text>
						<Image src={GrumpyGif} />
					</VStack>

					<VStack>
						<Text fontWeight='bold' mb={2}>
              Michigan Tech Courses
						</Text>
						<Image src={LightningGif} />
					</VStack>
				</HStack>
			</VStack>

			<VStack align='flex-start'>
				<Heading size='md' id='mobile'>
          📱 Mobile App
				</Heading>
				<p>
          Want to use this on your phone? Check out the 3rd Party Michigan Tech
          Courses Mobile app for Android. The app is{' '}
					<WrappedLink
						href='https://github.com/MichiganTechCoursesMobile/MTUCoursesAndroid'
						display='inline-block'
					>
            open source
					</WrappedLink>{' '}
          and currently available on the{' '}
					<WrappedLink
						href='https://play.google.com/store/apps/details?id=com.mtucoursesmobile.michigantechcourses'
						display='inline-block'
					>
            Google Play Store
					</WrappedLink>
				</p>
			</VStack>

			<VStack align='flex-start'>
				<Heading size='md' id='improvements'>
          🤔 Possible improvements
				</Heading>

				<UnorderedList stylePosition='inside'>
					<ListItem>
            Allow viewing baskets across multiple semesters at once
					</ListItem>
					<ListItem>Show the schedule for any classroom on campus</ListItem>
					<ListItem>
            Allow sharing a basket as a link (send to your advisor or friends)
					</ListItem>
					<ListItem>
            Allow students to add links / details to courses (like adding an
            invite link to a Discord server)
					</ListItem>
				</UnorderedList>

				<p>
          While I plan to maintain this site for the foreseeable future, I'm not
          planning on adding the above features or anything else.
				</p>

				<p>
          If you know{' '}
					<WrappedLink href='#tech'>some of the tech I'm using</WrappedLink> and
          want to help maintain this and/or implement new features, please{' '}
					<WrappedLink href='#contact'>reach out</WrappedLink>!
				</p>
			</VStack>

			<VStack align='flex-start'>
				<Heading size='md'>📝 Notes</Heading>

				<p>
          All times are in EST and are not adjusted for your current location.
          If you're in MN and a class section is labeled as starting at 10:00
          AM, it would start at 9:00 AM in local time. Generated calendar events
          are not adjusted either for local time, but because they're based off
          of UTC will work just fine across timezones (i.e. you can imported a
          generated calendar in MN before coming up to school and the times will
          stay consistent).
				</p>

				<p>
          Some courses have wrong "semesters offered" data. This is an issue
          with Banweb and not this site.
				</p>
			</VStack>

			<VStack align='flex-start'>
				<Heading size='md' id='contact'>
          📮 Contact
				</Heading>

				<Text as='span'>
          Ran into a nasty bug? Or have a cool idea that you'd like to see
          implemented?
				</Text>

				<Text as='span'>
          If you have a GitHub account, feel free to{' '}
					<WrappedLink
						href='https://github.com/Michigan-Tech-Courses/frontend/issues'
						display='inline-block'
					>
            make an issue
					</WrappedLink>
          . Otherwise, you can{' '}
					<WrappedLink href='mailto:hi@maxisom.me' display='inline-block'>
            email me directly
					</WrappedLink>
          .
				</Text>
			</VStack>

			<VStack align='flex-start'>
				<Heading size='md'>❤️ Open source</Heading>

				<Text as='span'>
          We're completely{' '}
					<WrappedLink
						href='https://github.com/Michigan-Tech-Courses'
						display='inline-block'
					>
            open-source
					</WrappedLink>
          !
				</Text>

				<Text as='span'>
          Hopefully some of the above repositories are useful for your own
          projects.
				</Text>
			</VStack>

			<VStack align='flex-start'>
				<Heading size='md' id='tech'>
          🧱 Tech stack
				</Heading>

				<Text as='span'>I'm currently using:</Text>

				<UnorderedList stylePosition='inside' lineHeight='2'>
					<ListItem>
            Frontend:
						<UnorderedList lineHeight='2'>
							<ListItem>React</ListItem>
							<ListItem>
								<WrappedLink href='https://nextjs.org/' display='inline-block'>
                  Next.js
								</WrappedLink>
							</ListItem>
							<ListItem>
								<WrappedLink
									href='https://chakra-ui.com/'
									display='inline-block'
								>
                  Chakra UI
								</WrappedLink>
							</ListItem>
							<ListItem>
								<WrappedLink href='https://lunrjs.com/' display='inline-block'>
                  Lunr
								</WrappedLink>
							</ListItem>
							<ListItem>
								<WrappedLink
									href='https://mobx.js.org/README.html'
									display='inline-block'
								>
                  MobX
								</WrappedLink>
							</ListItem>
						</UnorderedList>
					</ListItem>

					<ListItem>
            Backend:
						<UnorderedList lineHeight='2'>
							<ListItem>
								<WrappedLink href='https://nestjs.com/' display='inline-block'>
                  NestJS
								</WrappedLink>
							</ListItem>
							<ListItem>Prisma</ListItem>
							<ListItem>
								<WrappedLink
									href='https://github.com/OptimalBits/bull'
									display='inline-block'
								>
                  Bull
								</WrappedLink>
							</ListItem>
							<ListItem>Redis</ListItem>
							<ListItem>PostgreSQL</ListItem>
							<ListItem>Kubernetes</ListItem>
							<ListItem>
								<WrappedLink href='http://thumbor.org/' display='inline-block'>
                  Thumbor
								</WrappedLink>
							</ListItem>
						</UnorderedList>
					</ListItem>

					<ListItem>
            Hosting / third party:
						<UnorderedList lineHeight='2'>
							<ListItem>
								<WrappedLink href='https://vercel.com' display='inline-block'>
                  Vercel
								</WrappedLink>
							</ListItem>
							<ListItem>
								<WrappedLink
									href='https://www.maxkvm.com/'
									display='inline-block'
								>
                  MaxKVM
								</WrappedLink>
							</ListItem>
							<ListItem>
								<WrappedLink
									href='https://www.datadoghq.com/'
									display='inline-block'
								>
                  Datadog
								</WrappedLink>
							</ListItem>
						</UnorderedList>
					</ListItem>
				</UnorderedList>
			</VStack>

			<VStack align='flex-start'>
				<Heading size='md'>↔️ API</Heading>

				<Text as='span'>
					<WrappedLink
						href='https://api.michigantechcourses.com/docs/static/index.html'
						display='inline-block'
					>
            The API
					</WrappedLink>{' '}
          is open and free to use, but please don't abuse it.
				</Text>
			</VStack>

			<VStack align='flex-start' mb={12}>
				<Heading size='md'>📜 Disclaimer</Heading>

				<Text as='span'>
          Although every effort is made to keep the information listed here
          up-to-date, I make no guarantees about the correctness of the
          information. Please check Banweb for the latest information.
				</Text>

				<Text as='span'>
          That being said, the most critical information here (course and
          section data) should be at most 10 minutes out of date at any given
          moment.
				</Text>
			</VStack>
		</VStack>
	</Container>
));

export default AboutPage;

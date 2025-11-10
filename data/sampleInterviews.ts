import { Interview } from '../types/interview';

export const sampleInterviews: Interview[] = [
  {
    interviewId: 'osu-2024-001',
    intervieweeName: 'Alex Thompson',
    interviewDate: '2024-03-15',
    interviewFormat: 'Prerecorded Zoom',
    interviewerName: 'Dr. Sarah Chen',
    demographics: {
      age: '21',
      gender: 'Female',
      major: 'Computer Science',
      year: 'Junior',
      other: 'Transfer student from community college',
    },
    transcript: {
      fileName: 'alex_thompson_interview.mp4',
      fileType: 'video/mp4',
      rawText: `Coming to Oregon State was honestly a bit overwhelming at first. I'm from a small town in Eastern Oregon, and suddenly I'm in this huge campus with thousands of students. My freshman year was rough - I struggled in CS161 because I had never programmed before, unlike a lot of my classmates who had been coding since high school. I almost changed majors after getting a C- on my first exam.

But then I discovered the tutoring center in Kelley Engineering Center. The TAs there were so patient and really helped me understand the fundamentals. I also joined a study group through the Women in CS club, which made a huge difference. We'd stay up late in the library working on projects together, and it felt less like competition and more like we were all in this together.

By sophomore year, I felt much more confident. I landed an internship at Intel through the OSU career fair - the career services office helped me polish my resume and practice interviewing. That internship changed everything. I came back for junior year knowing I was on the right path.

The community here has been incredible. The Women in CS club has been my anchor - it's where I found my best friends and mentors. There's this sense that we're all supporting each other, especially as women in a male-dominated field. It's been empowering to see so many people breaking stereotypes in tech.

If I'm being honest, though, there are still challenges. The mental health resources on campus are stretched thin. During finals week last term, I tried to get a counseling appointment and had to wait three weeks. By that point, finals were over. I ended up leaning on my friends instead, which helped, but I know not everyone has that support system.

Also, some of the CS curriculum feels outdated. We're learning languages and frameworks that aren't used much in industry anymore. I wish there were more courses on modern web development or mobile app development - things that would make us more marketable to employers.

Looking back, I'm glad I stuck with it. Oregon State gave me opportunities I never would have had otherwise. The combination of strong academics, supportive community, and career resources has set me up for success. I'm already getting interview requests from tech companies for full-time positions after graduation.`,
      wordCount: 387,
      validation: {
        minimumLengthCheck: {
          passed: true,
          warningIssued: false,
          overrideApprovedBy: '',
        },
      },
    },
    analysis: {
      model: {
        provider: 'OpenRouter',
        modelName: 'anthropic/claude-3.5-sonnet',
        temperature: 0.7,
        promptVersion: 'v2.1',
        promptTemplateId: 'osu-student-interview-analysis',
      },
      summaries: [
        {
          category: 'Academic Experience',
          title: 'Initial Struggles and Growth in Computer Science',
          summaryText: 'Alex experienced significant challenges during freshman year in CS161, having no prior programming experience. Through tutoring center support and study groups, confidence grew by sophomore year. Concerns remain about curriculum relevance to current industry practices.',
        },
        {
          category: 'Career Development',
          title: 'Successful Internship and Career Preparation',
          summaryText: 'Landed Intel internship through OSU career fair with help from career services. Currently receiving interview requests from tech companies for post-graduation. Benefited from career services resume review and interview practice.',
        },
        {
          category: 'Campus Support Systems',
          title: 'Community Support vs. Resource Limitations',
          summaryText: 'Strong peer support through Women in CS club and study groups. However, mental health services are inadequate with 3-week wait times during high-stress periods. Community support partially compensates for institutional gaps.',
        },
      ],
      timelinePoints: [
        {
          eventDescription: 'Struggled in CS161 with no prior programming experience, nearly changed majors after poor exam performance',
          timeframeType: 'Freshman Year',
          category: 'Academic Challenge',
          sentiment: 'Negative',
        },
        {
          eventDescription: 'Discovered tutoring center in Kelley Engineering Center and joined Women in CS study group',
          timeframeType: 'Freshman Year',
          category: 'Support Discovery',
          sentiment: 'Positive',
        },
        {
          eventDescription: 'Gained confidence and felt more prepared for coursework',
          timeframeType: 'Sophomore Year',
          category: 'Personal Growth',
          sentiment: 'Positive',
        },
        {
          eventDescription: 'Landed Intel internship through OSU career fair with career services support',
          timeframeType: 'Sophomore Year',
          category: 'Career Milestone',
          sentiment: 'Positive',
        },
        {
          eventDescription: 'Attempted to schedule counseling during finals week, faced 3-week wait time',
          timeframeType: 'Junior Year - Last Term',
          category: 'Mental Health Support Gap',
          sentiment: 'Negative',
        },
        {
          eventDescription: 'Receiving interview requests from tech companies for post-graduation positions',
          timeframeType: 'Junior Year - Current',
          category: 'Career Success',
          sentiment: 'Positive',
        },
      ],
      themes: [
        {
          themeId: 'theme-001',
          title: 'Academic Support Systems',
          description: 'Importance of accessible tutoring, study groups, and peer support. Kelley Engineering Center tutoring and TA support were critical turning points.',
          frequency: 8,
          impactScore: 9,
          actionable: true,
          category: 'Student Support',
          relatedQuoteIds: ['quote-001', 'quote-002'],
        },
        {
          themeId: 'theme-002',
          title: 'Career Preparation Resources',
          description: 'Career services, career fairs, and industry connections are highly valued. Resume review and interview practice are highly valued.',
          frequency: 5,
          impactScore: 8,
          actionable: true,
          category: 'Career Development',
          relatedQuoteIds: ['quote-003'],
        },
        {
          themeId: 'theme-003',
          title: 'Mental Health Support Gaps',
          description: 'Long wait times for counseling appointments, especially during high-stress periods. Students need more timely access to mental health resources.',
          frequency: 3,
          impactScore: 7,
          actionable: true,
          category: 'Student Wellbeing',
          relatedQuoteIds: ['quote-004'],
        },
        {
          themeId: 'theme-004',
          title: 'Community and Belonging',
          description: 'Student organizations like Women in CS provide crucial peer support and sense of belonging. Collaborative culture over competitive.',
          frequency: 6,
          impactScore: 8,
          actionable: false,
          category: 'Campus Culture',
          relatedQuoteIds: ['quote-002', 'quote-005'],
        },
      ],
      quotes: [
        {
          quoteId: 'quote-001',
          quoteText: 'The TAs there were so patient and really helped me understand the fundamentals.',
          context: 'Discussing the tutoring center in Kelley Engineering Center',
          timestamp: '00:05:32',
          tags: ['tutoring', 'academic support', 'TA support'],
          sentiment: 'Positive',
          significanceLevel: 'High',
          relatedThemeIds: ['theme-001'],
        },
        {
          quoteId: 'quote-002',
          quoteText: "We'd stay up late in the library working on projects together, and it felt less like competition and more like we were all in this together.",
          context: 'Describing study groups and collaborative learning',
          timestamp: '00:07:15',
          tags: ['peer support', 'study groups', 'collaboration'],
          sentiment: 'Positive',
          significanceLevel: 'High',
          relatedThemeIds: ['theme-001', 'theme-004'],
        },
        {
          quoteId: 'quote-003',
          quoteText: 'The career services office helped me polish my resume and practice interviewing.',
          context: 'Preparation for Intel internship',
          timestamp: '00:09:45',
          tags: ['career services', 'internship preparation', 'professional development'],
          sentiment: 'Positive',
          significanceLevel: 'Medium',
          relatedThemeIds: ['theme-002'],
        },
        {
          quoteId: 'quote-004',
          quoteText: 'During finals week last term, I tried to get a counseling appointment and had to wait three weeks.',
          context: 'Discussing mental health resources and wait times',
          timestamp: '00:13:20',
          tags: ['mental health', 'counseling', 'resource constraints', 'finals stress'],
          sentiment: 'Negative',
          significanceLevel: 'High',
          relatedThemeIds: ['theme-003'],
        },
        {
          quoteId: 'quote-005',
          quoteText: "It's been empowering to see so many people breaking stereotypes in tech.",
          context: 'Reflecting on Women in CS club',
          timestamp: '00:11:10',
          tags: ['diversity', 'empowerment', 'women in tech'],
          sentiment: 'Positive',
          significanceLevel: 'Medium',
          relatedThemeIds: ['theme-004'],
        },
        {
          quoteId: 'quote-006',
          quoteText: 'I almost changed majors after getting a C- on my first exam.',
          context: 'Early struggles in CS161',
          timestamp: '00:03:15',
          tags: ['academic struggle', 'persistence', 'first-year experience'],
          sentiment: 'Negative',
          significanceLevel: 'High',
          relatedThemeIds: ['theme-001'],
        },
      ],
      areasForImprovement: [
        {
          areaId: 'improvement-001',
          title: 'Expand Mental Health Counseling Capacity',
          description: 'Reduce wait times for counseling appointments, especially during high-stress periods like midterms and finals. Consider adding crisis counselors and expanding drop-in hours.',
          priority: 'High',
          stakeholders: ['Student Health Services', 'Counseling Center', 'Dean of Student Life'],
          actionItems: [
            'Hire additional counselors for peak periods',
            'Implement crisis walk-in hours',
            'Create peer support programs as first-line resources',
            'Expand virtual counseling options',
          ],
        },
        {
          areaId: 'improvement-002',
          title: 'Modernize CS Curriculum',
          description: 'Incorporate courses on current industry-standard frameworks like React, Node.js, and modern web development practices to better prepare students for industry.',
          priority: 'Medium',
          stakeholders: ['CS Department', 'Industry Advisory Board', 'Career Services'],
          actionItems: [
            'Survey recent graduates and employers on skill gaps',
            'Develop elective courses on modern frameworks',
            'Partner with industry for curriculum input',
            'Create project-based learning opportunities with real-world applications',
          ],
        },
        {
          areaId: 'improvement-003',
          title: 'Strengthen First-Year Transition Support',
          description: 'Enhance support systems for first-year students, particularly those without prior programming experience or from underrepresented backgrounds.',
          priority: 'High',
          stakeholders: ['Academic Advising', 'CS Department', 'Student Success Center'],
          actionItems: [
            'Create CS101 primer course for students without programming background',
            'Expand TA office hours and tutoring capacity',
            'Implement peer mentoring program pairing upperclassmen with freshmen',
            'Develop early intervention system to identify struggling students',
          ],
        },
      ],
    },
    status: 'pending',
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      source: 'manual-upload',
      validatedBy: '',
    },
  },
  {
    interviewId: 'osu-2024-002',
    intervieweeName: 'Maria Rodriguez',
    interviewDate: '2024-03-18',
    interviewFormat: 'Prerecorded Zoom',
    interviewerName: 'Dr. Sarah Chen',
    demographics: {
      age: '23',
      gender: 'Female',
      major: 'Mechanical Engineering',
      year: 'Senior',
      other: 'First-generation college student',
    },
    transcript: {
      fileName: 'maria_rodriguez_interview.mp4',
      fileType: 'video/mp4',
      rawText: `Being a first-generation college student at OSU has been both incredibly rewarding and challenging in ways I didn't expect. My parents immigrated from Mexico and never had the chance to go to college, so navigating this whole system has been a learning experience for all of us.

The financial aid process was overwhelming at first. I didn't know about FAFSA deadlines or how to apply for scholarships. Luckily, the financial aid office had workshops specifically for first-gen students that walked us through everything. That support made a huge difference - I don't think I would have figured it out on my own.

Academically, mechanical engineering is no joke. The workload is intense, and sometimes I feel like I'm barely keeping my head above water. But the study spaces in the library and the quiet rooms in the engineering buildings have been lifesavers. I practically live in the library during finals week.

One thing that's been tough is feeling like I don't quite fit in sometimes. A lot of my classmates have parents who are engineers or work in tech, and they seem to have this built-in understanding of how the industry works. Meanwhile, I'm figuring everything out as I go. The SHPE chapter (Society of Hispanic Professional Engineers) has been amazing though - it's where I found people who understand what I'm going through.

Professors have generally been helpful, but there's definitely variability. Some are really accessible and want to help you succeed. Others seem like they're just going through the motions. I wish there was more consistency in office hour availability and responsiveness to emails.

The career fair has been a mixed experience. I've gotten some good leads, but I also feel like there's this expectation that you should already know exactly what you want to do and have the perfect resume. More guidance on career paths within mechanical engineering would be helpful - it's such a broad field.

Transportation has been a challenge too. I don't have a car, and while the bus system is decent, it can be frustrating when you're trying to get to an off-campus job or internship. I ended up turning down a really good internship opportunity last summer because I couldn't reliably get there.

Despite the challenges, I'm proud of how far I've come. I'm on track to graduate next year, and I'm the first person in my family to get a college degree. That means everything to me and my family. OSU has given me opportunities I never would have had otherwise, even if the path hasn't always been smooth.`,
      wordCount: 432,
      validation: {
        minimumLengthCheck: {
          passed: true,
          warningIssued: false,
          overrideApprovedBy: '',
        },
      },
    },
    analysis: {
      model: {
        provider: 'OpenRouter',
        modelName: 'anthropic/claude-3.5-sonnet',
        temperature: 0.7,
        promptVersion: 'v2.1',
        promptTemplateId: 'osu-student-interview-analysis',
      },
      summaries: [
        {
          category: 'First-Generation Experience',
          title: 'Navigating Higher Education as First-Generation Student',
          summaryText: 'As a first-gen student, Maria faced challenges understanding financial aid, scholarships, and college systems. Financial aid workshops for first-gen students were crucial. Family pride in being the first college graduate is a significant motivator.',
        },
        {
          category: 'Academic Experience',
          title: 'Managing Intense ME Workload and Study Resources',
          summaryText: 'ME coursework is demanding with heavy workload. Library study spaces and quiet engineering building rooms are essential resources. Professor accessibility varies significantly, creating inconsistent support experience.',
        },
        {
          category: 'Career Development',
          title: 'Career Fair Challenges and Need for Guidance',
          summaryText: 'Career fair experiences mixed - good leads but intimidating expectations. Needs more guidance on career paths within broad ME field. Lack of transportation limited internship opportunities.',
        },
      ],
      timelinePoints: [
        {
          eventDescription: 'Struggled with understanding FAFSA and scholarship application process',
          timeframeType: 'Early College',
          category: 'Financial Aid',
          sentiment: 'Negative',
        },
        {
          eventDescription: 'Attended financial aid workshops for first-generation students',
          timeframeType: 'Early College',
          category: 'Support Discovery',
          sentiment: 'Positive',
        },
        {
          eventDescription: 'Joined SHPE chapter and found community of students with similar backgrounds',
          timeframeType: 'Sophomore/Junior Year',
          category: 'Community Building',
          sentiment: 'Positive',
        },
        {
          eventDescription: 'Turned down internship opportunity due to transportation challenges',
          timeframeType: 'Last Summer',
          category: 'Career Setback',
          sentiment: 'Negative',
        },
        {
          eventDescription: 'On track to graduate as first in family with college degree',
          timeframeType: 'Senior Year - Current',
          category: 'Academic Milestone',
          sentiment: 'Positive',
        },
      ],
      themes: [
        {
          themeId: 'theme-010',
          title: 'First-Generation Student Support',
          description: 'Specialized workshops and guidance are critical for first-gen students navigating unfamiliar systems. Financial aid and general college navigation support needed.',
          frequency: 7,
          impactScore: 9,
          actionable: true,
          category: 'Student Support',
          relatedQuoteIds: ['quote-010', 'quote-015'],
        },
        {
          themeId: 'theme-011',
          title: 'Professor Accessibility and Consistency',
          description: 'Significant variability in professor responsiveness and office hour availability creates uneven support. Need for consistent faculty engagement standards.',
          frequency: 4,
          impactScore: 6,
          actionable: true,
          category: 'Academic Support',
          relatedQuoteIds: ['quote-012'],
        },
        {
          themeId: 'theme-012',
          title: 'Transportation Barriers',
          description: 'Lack of personal transportation limits access to off-campus internships and jobs. Public transit system inadequate for some career opportunities.',
          frequency: 3,
          impactScore: 8,
          actionable: true,
          category: 'Infrastructure',
          relatedQuoteIds: ['quote-014'],
        },
        {
          themeId: 'theme-013',
          title: 'Cultural Belonging and Identity',
          description: 'First-gen and underrepresented students need community spaces and organizations. SHPE provides crucial peer support and shared experience.',
          frequency: 5,
          impactScore: 7,
          actionable: false,
          category: 'Campus Culture',
          relatedQuoteIds: ['quote-011'],
        },
      ],
      quotes: [
        {
          quoteId: 'quote-010',
          quoteText: "The financial aid office had workshops specifically for first-gen students that walked us through everything. That support made a huge difference - I don't think I would have figured it out on my own.",
          context: 'Describing financial aid navigation support',
          timestamp: '00:02:45',
          tags: ['financial aid', 'first-generation support', 'workshops'],
          sentiment: 'Positive',
          significanceLevel: 'High',
          relatedThemeIds: ['theme-010'],
        },
        {
          quoteId: 'quote-011',
          quoteText: "The SHPE chapter has been amazing though - it's where I found people who understand what I'm going through.",
          context: 'Discussing sense of belonging and community',
          timestamp: '00:07:20',
          tags: ['student organizations', 'SHPE', 'belonging', 'peer support'],
          sentiment: 'Positive',
          significanceLevel: 'High',
          relatedThemeIds: ['theme-013'],
        },
        {
          quoteId: 'quote-012',
          quoteText: 'Some professors are really accessible and want to help you succeed. Others seem like they\'re just going through the motions.',
          context: 'Comparing different professors\' engagement levels',
          timestamp: '00:08:55',
          tags: ['professor quality', 'faculty engagement', 'accessibility'],
          sentiment: 'Neutral',
          significanceLevel: 'Medium',
          relatedThemeIds: ['theme-011'],
        },
        {
          quoteId: 'quote-013',
          quoteText: 'More guidance on career paths within mechanical engineering would be helpful - it\'s such a broad field.',
          context: 'Reflecting on career services and guidance',
          timestamp: '00:10:15',
          tags: ['career guidance', 'mechanical engineering', 'career services'],
          sentiment: 'Neutral',
          significanceLevel: 'Medium',
          relatedThemeIds: [],
        },
        {
          quoteId: 'quote-014',
          quoteText: 'I ended up turning down a really good internship opportunity last summer because I couldn\'t reliably get there.',
          context: 'Discussing transportation barriers to internships',
          timestamp: '00:11:30',
          tags: ['transportation', 'internship', 'access barrier'],
          sentiment: 'Negative',
          significanceLevel: 'High',
          relatedThemeIds: ['theme-012'],
        },
        {
          quoteId: 'quote-015',
          quoteText: "I'm the first person in my family to get a college degree. That means everything to me and my family.",
          context: 'Reflecting on personal and family significance of graduation',
          timestamp: '00:13:05',
          tags: ['first-generation', 'family pride', 'milestone'],
          sentiment: 'Positive',
          significanceLevel: 'High',
          relatedThemeIds: ['theme-010'],
        },
      ],
      areasForImprovement: [
        {
          areaId: 'improvement-010',
          title: 'Expand First-Generation Student Programming',
          description: 'Create comprehensive support system including peer mentoring, specialized advising, and ongoing workshops beyond just financial aid topics.',
          priority: 'High',
          stakeholders: ['First-Generation Student Success Office', 'Academic Advising', 'Student Life'],
          actionItems: [
            'Establish first-gen peer mentoring program',
            'Create year-round workshop series on various college navigation topics',
            'Develop first-gen student center or dedicated space',
            'Train faculty and staff on first-gen student needs',
          ],
        },
        {
          areaId: 'improvement-011',
          title: 'Standardize Faculty Accessibility',
          description: 'Establish and enforce minimum standards for office hours, email response times, and student interaction to ensure consistent support.',
          priority: 'Medium',
          stakeholders: ['College of Engineering', 'Department Heads', 'Faculty Development'],
          actionItems: [
            'Create faculty accessibility guidelines',
            'Include accessibility metrics in teaching evaluations',
            'Provide training on effective student engagement',
            'Recognize and reward faculty with strong accessibility records',
          ],
        },
        {
          areaId: 'improvement-012',
          title: 'Address Transportation Barriers',
          description: 'Improve access to off-campus internships and jobs through enhanced transportation options or partnerships.',
          priority: 'High',
          stakeholders: ['Career Services', 'Transportation Services', 'Student Life'],
          actionItems: [
            'Partner with ride-sharing services for internship transportation',
            'Create carpool matching system for students',
            'Negotiate employer shuttle services for major internship sites',
            'Provide transportation stipends for students in need',
          ],
        },
        {
          areaId: 'improvement-013',
          title: 'Enhanced Career Path Guidance for Broad Majors',
          description: 'Provide more detailed career path exploration and guidance for majors with diverse career options like ME.',
          priority: 'Medium',
          stakeholders: ['Career Services', 'ME Department', 'Alumni Relations'],
          actionItems: [
            'Create career path maps for different ME specializations',
            'Host alumni panels showcasing diverse ME career paths',
            'Offer career exploration workshops for underclassmen',
            'Develop online career resource portal with industry insights',
          ],
        },
      ],
    },
    status: 'pending',
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      source: 'manual-upload',
      validatedBy: '',
    },
  },
  {
    interviewId: 'osu-2024-003',
    intervieweeName: 'Jordan Lee',
    interviewDate: '2024-03-20',
    interviewFormat: 'Prerecorded Zoom',
    interviewerName: 'Dr. Michael Roberts',
    demographics: {
      age: '20',
      gender: 'Male',
      major: 'Business Administration',
      year: 'Sophomore',
      other: 'International student from South Korea',
    },
    transcript: {
      fileName: 'jordan_lee_interview.mp4',
      fileType: 'video/mp4',
      rawText: `Moving from Seoul to Corvallis was a huge culture shock. Everything is so different - the food, the language barriers, the way classes are structured. Back home in Korea, lectures are very formal and you don't really interact with professors. Here, professors want you to come to office hours and ask questions. It took me a while to get comfortable with that.

The international student office has been a lifeline. They helped me navigate visa issues, opened a bank account, understand how American grades work - all the practical stuff that's overwhelming when you first arrive. I also joined the Korean Student Association, which has been amazing for finding community and not feeling so homesick. We do traditional holiday celebrations and it really helps.

Language has been my biggest challenge. I studied English for years in Korea, but academic English is different. Writing essays and understanding lectures when professors speak fast is really difficult. I use the writing center every week for my papers. The tutors are patient but sometimes I feel embarrassed that I need so much help with basic writing.

The College of Business has been supportive though. My advisor recommended I take a lighter course load my first year while I adjust, which was good advice. I'm also working with a speaking partner through the INTO program to improve my conversational English. It's getting better but I still worry about group projects where I have to present.

One thing that surprised me is how expensive everything is. Tuition is higher for international students, and the exchange rate makes it even worse. My family is making sacrifices to send me here, so I feel pressure to do really well. I work part-time at the dining hall to help with expenses, but it's hard to balance work and studying.

I wish there were more career resources specifically for international students. The job search process is completely different here - resumes, cover letters, networking. And there are visa restrictions on where I can work. The career center is helpful but they don't always understand the unique challenges international students face with work authorization.

Despite everything, I'm grateful to be here. Oregon State is giving me opportunities I wouldn't have in Korea. The business program is well-respected, and I'm learning so much about American business culture. I just hope I can find a job here after graduation that will sponsor my visa, because going back to Korea isn't really my plan anymore.`,
      wordCount: 405,
      validation: {
        minimumLengthCheck: {
          passed: true,
          warningIssued: false,
          overrideApprovedBy: '',
        },
      },
    },
    analysis: {
      model: {
        provider: 'OpenRouter',
        modelName: 'anthropic/claude-3.5-sonnet',
        temperature: 0.7,
        promptVersion: 'v2.1',
        promptTemplateId: 'osu-student-interview-analysis',
      },
      summaries: [
        {
          category: 'Cultural Adjustment',
          title: 'International Student Transition Challenges',
          summaryText: 'Significant culture shock moving from Seoul to Corvallis. Adjusting to American classroom culture where professor interaction is encouraged. Language barriers in academic settings despite years of English study. Korean Student Association provides crucial community support.',
        },
        {
          category: 'Academic Support',
          title: 'Language Support and Course Load Adjustment',
          summaryText: 'Weekly use of writing center for essay help. Advisor recommended lighter first-year course load for adjustment period. INTO speaking partner program helping with conversational English. Still experiences anxiety about group presentations.',
        },
        {
          category: 'Financial Pressure',
          title: 'International Student Financial Burden',
          summaryText: 'Higher tuition for international students combined with unfavorable exchange rates creates significant financial pressure. Family making sacrifices for education. Works part-time at dining hall while managing academic workload.',
        },
      ],
      timelinePoints: [
        {
          eventDescription: 'Arrived from Seoul, experienced major culture shock with food, language, and classroom structure',
          timeframeType: 'First Semester',
          category: 'Cultural Adjustment',
          sentiment: 'Negative',
        },
        {
          eventDescription: 'Connected with international student office for visa, banking, and grade system navigation',
          timeframeType: 'First Semester',
          category: 'Support Discovery',
          sentiment: 'Positive',
        },
        {
          eventDescription: 'Joined Korean Student Association and found community through traditional celebrations',
          timeframeType: 'First Year',
          category: 'Community Building',
          sentiment: 'Positive',
        },
        {
          eventDescription: 'Started using writing center weekly, feeling self-conscious about needing help',
          timeframeType: 'First Year',
          category: 'Academic Support',
          sentiment: 'Neutral',
        },
        {
          eventDescription: 'Took advisor recommendation for lighter course load during adjustment period',
          timeframeType: 'First Year',
          category: 'Academic Planning',
          sentiment: 'Positive',
        },
        {
          eventDescription: 'Started part-time work at dining hall to help with expenses',
          timeframeType: 'Sophomore Year',
          category: 'Financial Management',
          sentiment: 'Neutral',
        },
      ],
      themes: [
        {
          themeId: 'theme-014',
          title: 'International Student Cultural Barriers',
          description: 'Challenges adapting to American educational culture, including classroom participation expectations and informal professor-student relationships.',
          category: 'Cultural Adjustment',
          frequency: 5,
          impactScore: 9,
          actionable: true,
          relatedQuoteIds: ['quote-020', 'quote-021'],
        },
        {
          themeId: 'theme-015',
          title: 'Language Support Needs',
          description: 'Academic English proficiency gaps despite prior English education. Ongoing need for writing and speaking support services.',
          category: 'Academic Support',
          frequency: 4,
          impactScore: 8,
          actionable: true,
          relatedQuoteIds: ['quote-022'],
        },
        {
          themeId: 'theme-016',
          title: 'International Student Financial Strain',
          description: 'Higher tuition costs, exchange rate impacts, and work-study balance challenges unique to international students.',
          category: 'Financial Wellbeing',
          frequency: 3,
          impactScore: 9,
          actionable: true,
          relatedQuoteIds: ['quote-023'],
        },
        {
          themeId: 'theme-017',
          title: 'Career Pathways for International Students',
          description: 'Lack of specialized career guidance addressing visa restrictions and work authorization complexities.',
          category: 'Career Development',
          frequency: 2,
          impactScore: 8,
          actionable: true,
          relatedQuoteIds: ['quote-024'],
        },
      ],
      quotes: [
        {
          quoteId: 'quote-020',
          quoteText: 'Back home in Korea, lectures are very formal and you don\'t really interact with professors. Here, professors want you to come to office hours and ask questions.',
          context: 'Describing cultural differences in student-professor relationships',
          timestamp: '00:08:30',
          sentiment: 'Neutral',
          significanceLevel: 'High',
          tags: ['Cultural Adjustment', 'Classroom Culture', 'Professor Interaction'],
          relatedThemeIds: ['theme-014'],
        },
        {
          quoteId: 'quote-021',
          quoteText: 'The international student office has been a lifeline. They helped me navigate visa issues, opened a bank account, understand how American grades work.',
          context: 'Highlighting essential support services for international students',
          timestamp: '00:12:15',
          sentiment: 'Positive',
          significanceLevel: 'High',
          tags: ['Support Services', 'International Student Office', 'Practical Support'],
          relatedThemeIds: ['theme-014'],
        },
        {
          quoteId: 'quote-022',
          quoteText: 'Writing essays and understanding lectures when professors speak fast is really difficult. I use the writing center every week but sometimes I feel embarrassed.',
          context: 'Expressing ongoing language challenges and emotional impact',
          timestamp: '00:15:45',
          sentiment: 'Negative',
          significanceLevel: 'High',
          tags: ['Language Barriers', 'Writing Support', 'Self-Consciousness'],
          relatedThemeIds: ['theme-015'],
        },
        {
          quoteId: 'quote-023',
          quoteText: 'Tuition is higher for international students, and the exchange rate makes it even worse. My family is making sacrifices to send me here.',
          context: 'Describing financial pressure and family expectations',
          timestamp: '00:18:20',
          sentiment: 'Negative',
          significanceLevel: 'High',
          tags: ['Financial Strain', 'International Tuition', 'Family Pressure'],
          relatedThemeIds: ['theme-016'],
        },
        {
          quoteId: 'quote-024',
          quoteText: 'The career center is helpful but they don\'t always understand the unique challenges international students face with work authorization.',
          context: 'Identifying gap in career services for international students',
          timestamp: '00:21:50',
          sentiment: 'Negative',
          significanceLevel: 'High',
          tags: ['Career Services', 'Work Authorization', 'International Student Needs'],
          relatedThemeIds: ['theme-017'],
        },
      ],
      areasForImprovement: [
        {
          areaId: 'improvement-014',
          title: 'International Student Orientation Enhancement',
          description: 'Expand orientation programs to better prepare international students for American classroom culture and participation expectations.',
          priority: 'High',
          stakeholders: ['International Programs', 'Academic Affairs', 'Faculty Development'],
          actionItems: [
            'Create cultural adjustment workshops on classroom participation',
            'Develop video tutorials explaining American academic norms',
            'Pair international students with peer mentors',
            'Offer practice sessions for office hours and professor interaction',
          ],
        },
        {
          areaId: 'improvement-015',
          title: 'Specialized International Career Services',
          description: 'Create dedicated career counseling for international students addressing visa restrictions and work authorization.',
          priority: 'High',
          stakeholders: ['Career Services', 'International Programs', 'Employers Relations'],
          actionItems: [
            'Hire career counselor specializing in international student employment',
            'Create workshops on OPT, CPT, and H1-B visa processes',
            'Build database of visa-sponsoring employers',
            'Offer specialized resume/cover letter guidance for international contexts',
          ],
        },
        {
          areaId: 'improvement-016',
          title: 'International Student Financial Resources',
          description: 'Develop financial literacy and support programs addressing unique challenges faced by international students.',
          priority: 'Medium',
          stakeholders: ['Financial Aid', 'International Programs', 'Student Life'],
          actionItems: [
            'Create international student emergency fund',
            'Offer financial planning workshops on currency exchange',
            'Expand on-campus employment opportunities',
            'Negotiate better exchange rates or payment plans',
          ],
        },
      ],
    },
    status: 'pending',
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      source: 'manual-upload',
      validatedBy: '',
    },
  },
];

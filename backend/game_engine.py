import random

class GameEngine:
    def __init__(self):
        self.trivia_db = {
            'python': [
                {'q': 'What data type is immutable in Python?', 'options': ['List', 'Dictionary', 'Set', 'Tuple'], 'correct': 'Tuple'},
                {'q': 'What does the GIL stand for?', 'options': ['Global Interpreter Lock', 'General Interface Loop', 'Graphical Integrated Layer', 'Global Interface Lock'], 'correct': 'Global Interpreter Lock'},
                {'q': 'Which keyword is used to create a generator?', 'options': ['return', 'yield', 'gen', 'produce'], 'correct': 'yield'},
                {'q': 'What is the purpose of dunder methods (e.g., __init__)?', 'options': ['Double underline', 'Operator overloading', 'Private methods', 'Static methods'], 'correct': 'Operator overloading'},
                {'q': 'Which library is commonly used for data manipulation?', 'options': ['Flask', 'Pandas', 'Requests', 'Django'], 'correct': 'Pandas'}
            ],
            'react': [
                {'q': 'What hook is used for side effects?', 'options': ['useState', 'useContext', 'useEffect', 'useReducer'], 'correct': 'useEffect'},
                {'q': 'How do you pass data to a child component?', 'options': ['State', 'Props', 'Context', 'Redux'], 'correct': 'Props'},
                {'q': 'Which method is required in a Class Component?', 'options': ['render()', 'return()', 'componentDidMount()', 'build()'], 'correct': 'render()'},
                {'q': 'What is the virtual DOM?', 'options': ['A direct copy of the DOM', 'An in-memory representation', 'A CSS styling method', 'A browser plugin'], 'correct': 'An in-memory representation'},
                {'q': 'Which hook provides access to the context?', 'options': ['useState', 'useContext', 'useRef', 'useMemo'], 'correct': 'useContext'}
            ],
            'sql': [
                {'q': 'Which command removes all records but keeps the table structure?', 'options': ['DROP', 'DELETE', 'TRUNCATE', 'REMOVE'], 'correct': 'TRUNCATE'},
                {'q': 'What does ACID stand for?', 'options': ['Atomicity, Consistency, Isolation, Durability', 'Association, Consistency, Isolation, Database', 'Atomicity, Connection, Integrity, Data', 'All, Common, Internal, Data'], 'correct': 'Atomicity, Consistency, Isolation, Durability'},
                {'q': 'What is a Foreign Key?', 'options': ['A primary key in another table', 'A unique index', 'A column for passwords', 'A table without data'], 'correct': 'A primary key in another table'},
                {'q': 'Which JOIN returns all rows from both tables?', 'options': ['INNER JOIN', 'LEFT JOIN', 'FULL JOIN', 'RIGHT JOIN'], 'correct': 'FULL JOIN'}
            ],
            'aws': [
                {'q': 'Which service provides object storage?', 'options': ['EC2', 'RDS', 'S3', 'Lambda'], 'correct': 'S3'},
                {'q': 'What is the serverless compute service?', 'options': ['EC2', 'Beanstalk', 'Lambda', 'Fargate'], 'correct': 'Lambda'},
                {'q': 'Which service is used for NoSQL databases?', 'options': ['RDS', 'Redshift', 'DynamoDB', 'ElastiCache'], 'correct': 'DynamoDB'},
                {'q': 'What does IAM stand for?', 'options': ['Identity and Access Management', 'Internal AWS Matrix', 'Internet Access Manager', 'Identity API Module'], 'correct': 'Identity and Access Management'}
            ]
        }

        self.bugs_db = [
            {
                'title': 'The Infinite Loop',
                'language': 'Python',
                'code': "def count_down(n):\n    while n > 0:\n        print(n)\n        n + 1",
                'options': ['Syntax Error', 'n is never decremented', 'Print statement is wrong', 'Function needs return'],
                'correct': 'n is never decremented',
                'explanation': 'n + 1 calculates the value but does not reassign it to n. Should be n -= 1.'
            },
            {
                'title': 'React State Mutation',
                'language': 'JavaScript',
                'code': "const [items, setItems] = useState([]);\n\nfunction addItem(item) {\n    items.push(item);\n    setItems(items);\n}",
                'options': ['Push returns length', 'Directly mutating state', 'Syntactically wrong', 'Need useEffect'],
                'correct': 'Directly mutating state',
                'explanation': 'Never mutate state directly. Use setItems([...items, item]).'
            },
            {
                'title': 'SQL Comparison Error',
                'language': 'SQL',
                'code': "SELECT * FROM users WHERE status = NULL",
                'options': ['Column status missing', 'Should use IS NULL', 'NULL is case sensitive', 'Semicolon missing'],
                'correct': 'Should use IS NULL',
                'explanation': 'In SQL, NULL comparison must use IS NULL or IS NOT NULL, not the equals operator.'
            },
            {
                'title': 'The Floating Point Trap',
                'language': 'JavaScript',
                'code': "if (0.1 + 0.2 === 0.3) {\n    alert('Equal!');\n} else {\n    alert('Not equal!');\n}",
                'options': ['Alerts Not equal!', 'Syntax Error', 'Missing semicolons', '0.1 is not valid'],
                'correct': 'Alerts Not equal!',
                'explanation': 'Floating point arithmetic in JS (and many languages) lead to precision issues. 0.1 + 0.2 is actually 0.30000000000000004.'
            }
        ]

        self.sim_scenarios = {
            'junior_dev': {
                'start': {
                    'text': 'It is 4:55 PM on Friday. A critical alert fires: "Production DB CPU at 99%". What do you do?',
                    'choices': [
                        {'text': 'Ignore it, it is probably a glitch.', 'next': 'failure_ignore'},
                        {'text': 'Check the running queries.', 'next': 'check_queries'},
                        {'text': 'Restart the database immediately.', 'next': 'failure_restart'}
                    ]
                },
                'check_queries': {
                    'text': 'You see a query: "SELECT * FROM logs" running for 4 hours. It was launched by the CTO.',
                    'choices': [
                        {'text': 'Kill the query immediately.', 'next': 'success_kill'},
                        {'text': 'Call the CTO to ask.', 'next': 'success_call'}
                    ]
                },
                'failure_ignore': {'text': '5:15 PM: The site goes down completely. You are fired. Game Over.', 'choices': []},
                'failure_restart': {'text': 'You restart the DB. Data corruption occurs because of unclean shutdown. The weekend is ruined. Game Over.', 'choices': []},
                'success_kill': {'text': 'You killed the query. CPU drops to 5%. The CTO sends a angry Slack message but thanks you later for saving production. +50 XP.', 'choices': []},
                'success_call': {'text': 'CTO says "Oops, wrong DB!". He cancels it. You saved the day with communication. +100 XP.', 'choices': []}
            }
        }

    def get_trivia(self, skills):
        """Get questions based on user skills."""
        questions = []
        # specific
        for s in skills:
            # Handle both string and dict formats
            skill_name = s['name'] if isinstance(s, dict) else s
            s_lower = skill_name.lower().strip()
            if s_lower in self.trivia_db:
                questions.extend(self.trivia_db[s_lower])
        
        # fallback
        if not questions:
            for k in self.trivia_db:
                questions.extend(self.trivia_db[k])
        
        random.shuffle(questions)
        return questions[:5]

    def get_bugs(self):
        return random.sample(self.bugs_db, min(len(self.bugs_db), 2))

    def get_scenario(self, scenario_id='junior_dev'):
        return self.sim_scenarios.get(scenario_id)

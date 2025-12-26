"""
Logic for job-linked skill simulations in Pathway.
Evaluates decisions and calculates impact on readiness.
"""

class SimulationEngine:
    SIMULATIONS = {
        'sql-perf-audit': {
            'id': 'sql-perf-audit',
            'title': 'SQL Performance Audit: Optimizing the Customer Dashboard',
            'role': 'Data Analyst',
            'target_skill': 'SQL Query Optimization',
            'estimated_time': '20-45 min',
            'max_impact': 15.0,
            'scenario': {
                'context': 'We\'re experiencing significant slowdowns on the Customer Overview Dashboard, particularly for the "Top Customers by Revenue" report. This report is critical for our sales and marketing teams, and they\'ve reported increased load times, sometimes exceeding 30 seconds, over the past 24 hours.',
                'problem_brief': 'The attached SQL query is the primary driver for this report. We suspect the recent increase in customer data volume might be contributing to the issue, but we haven\'t made any explicit changes to the query itself recently.',
                'key_areas': ['Indexing strategies', 'Query rewrite opportunities', 'Database resource utilization']
            },
            'actions': [
                {
                    'id': 'inspect-plan',
                    'label': 'Inspect Query Plan',
                    'description': 'Analyze the execution plan to understand how the database processes the query.',
                    'time': '5 min',
                    'risk': 'Low',
                    'complexity': 'Low',
                    'impact': 2.0
                },
                {
                    'id': 'sample-rows',
                    'label': 'Sample More Rows',
                    'description': 'Fetch a larger sample of data to verify data distribution and potential skew.',
                    'time': '10 min',
                    'risk': 'Low',
                    'complexity': 'Medium',
                    'impact': 1.0,
                    'cost_label': 'Moderate Cost'
                },
                {
                    'id': 'suggest-index',
                    'label': 'Suggest Indexing',
                    'description': 'Propose adding an index on "orders.order_date" column.',
                    'time': '15 min',
                    'risk': 'High',
                    'complexity': 'Medium',
                    'impact': 5.0,
                    'risk_label': 'High Risk',
                    'extra_label': 'Irreversible (without rollback)'
                },
                {
                    'id': 'optimize-joins',
                    'label': 'Optimize Joins',
                    'description': 'Rewrite or reorder joins to improve execution efficiency.',
                    'time': '20 min',
                    'risk': 'Medium',
                    'complexity': 'High',
                    'impact': 7.0,
                    'complexity_label': 'High Complexity'
                }
            ]
        },
        'python-data-cleanup': {
            'id': 'python-data-cleanup',
            'title': 'Data Engineering: Pipeline Failure Recovery',
            'role': 'Data Engineer',
            'target_skill': 'Python Data Engineering',
            'estimated_time': '15-30 min',
            'max_impact': 12.0,
            'scenario': {
                'context': 'The nightly ETL pipeline for the "Monthly Sales Report" failed due to unexpected schema changes in the source JSON files. Over 50,000 records are currently stuck in the "Dirty" queue.',
                'problem_brief': 'The Python script responsible for cleaning the data is throwing a "KeyError". We need to modify the cleaning logic to handle missing keys gracefully and re-process the batch without duplicates.',
                'key_areas': ['Exception handling', 'Schema validation', 'Idempotent processing']
            },
            'actions': [
                {
                    'id': 'add-try-except',
                    'label': 'Add Try-Except Block',
                    'description': 'Wrap missing key access in try-except to log and skip invalid records.',
                    'time': '5 min',
                    'risk': 'Low',
                    'complexity': 'Low',
                    'impact': 3.0
                },
                {
                    'id': 'pydantic-val',
                    'label': 'Implement Pydantic Validation',
                    'description': 'Use Pydantic models to strictly validate incoming JSON schema.',
                    'time': '15 min',
                    'risk': 'Low',
                    'complexity': 'Medium',
                    'impact': 6.0
                },
                {
                    'id': 'upsert-logic',
                    'label': 'Implement Upsert Logic',
                    'description': 'Modify the database sink to use UPSERT to prevent record duplication during retry.',
                    'time': '10 min',
                    'risk': 'Medium',
                    'complexity': 'Medium',
                    'impact': 4.0
                }
            ]
        },
        'aws-security-audit': {
            'id': 'aws-security-audit',
            'title': 'Cloud Security: IAM Policy Hardening',
            'role': 'DevOps Engineer',
            'target_skill': 'Cloud Platform (AWS)',
            'estimated_time': '20-35 min',
            'max_impact': 10.0,
            'scenario': {
                'context': 'A security scan has flagged several IAM roles in our production account with "AdministratorAccess" or overly broad "Resource": "*" permissions.',
                'problem_brief': 'We need to move towards the "Principle of Least Privilege". Your task is to audit the "Web-Server-Role" and restrict its access to only the necessary S3 buckets and DynamoDB tables.',
                'key_areas': ['IAM Role configuration', 'S3 Bucket Policies', 'Resource-level permissions']
            },
            'actions': [
                {
                    'id': 'remove-admin',
                    'label': 'Remove AdministratorAccess',
                    'description': 'Detach the managed AdministratorAccess policy from the role.',
                    'time': '5 min',
                    'risk': 'Medium',
                    'complexity': 'Low',
                    'impact': 4.0
                },
                {
                    'id': 'limit-res',
                    'label': 'Limit Resource Scope',
                    'description': 'Replace "*" in Resource blocks with specific ARNs of the production buckets.',
                    'time': '15 min',
                    'risk': 'High',
                    'complexity': 'Medium',
                    'impact': 6.0,
                    'risk_label': 'High Risk of Downtime'
                }
            ]
        },
        'react-perf-fix': {
            'id': 'react-perf-fix',
            'title': 'Frontend: React Component Optimization',
            'role': 'Software Developer',
            'target_skill': 'React & Frontend Performance',
            'estimated_time': '15-25 min',
            'max_impact': 15.0,
            'scenario': {
                'context': 'The "Global Search" component is rerendering excessively, causing a noticeable UI lag when users type. The current implementation uses a heavy list that resets on every keystroke.',
                'problem_brief': 'Your task is to implement memoization and debouncing to stop the unnecessary rerenders and improve the input responsiveness.',
                'key_areas': ['useMemo/useCallback', 'Debouncing implementation', 'Virtualization basics']
            },
            'actions': [
                {
                    'id': 'apply-memo',
                    'label': 'Apply React.memo',
                    'description': 'Wrap the list item components in React.memo to prevent rerenders when props dont change.',
                    'time': '5 min',
                    'risk': 'Low',
                    'complexity': 'Low',
                    'impact': 5.0
                },
                {
                    'id': 'debounce-input',
                    'label': 'Debounce Search Input',
                    'description': 'Implement a 300ms debounce on the search term change to reduce filtering frequency.',
                    'time': '10 min',
                    'risk': 'Low',
                    'complexity': 'Medium',
                    'impact': 10.0
                }
            ]
        }
    }

    @classmethod
    def get_simulation(cls, sim_id):
        return cls.SIMULATIONS.get(sim_id)

    @classmethod
    def evaluate_submission(cls, sim_id, decisions, justification):
        sim = cls.SIMULATIONS.get(sim_id)
        if not sim:
            return None

        total_impact = 0.0
        details = []

        # 1. Action Impact - Base Technical Capability
        for action_id in decisions:
            action = next((a for a in sim['actions'] if a['id'] == action_id), None)
            if action:
                total_impact += action['impact']
                details.append({
                    'action': action['label'],
                    'impact': action['impact'],
                    'type': 'technical'
                })
        
        # 2. Justification Analysis (Heuristic Keyword Matching)
        # Professional vocabulary check
        keywords = {
            'sql-perf-audit': ['index', 'execution plan', 'scan', 'join', 'cost', 'selectivity', 'optimization', 'bottleneck', 'performance'],
            'python-data-cleanup': ['try', 'except', 'pydantic', 'schema', 'validation', 'upsert', 'duplicate', 'error handling', 'idempotent'],
            'aws-security-audit': ['least privilege', 'policy', 'arn', 'role', 'access', 'wildcard', 'iam', 'hardening', 'audit'],
            'react-perf-fix': ['memo', 'render', 'debounce', 'state', 'virtual', 'callback', 'rerender', 'optimization', 'hooks']
        }
        
        target_words = keywords.get(sim_id, [])
        found_words = [w for w in target_words if w.lower() in justification.lower()]
        
        # Communicative Score (Bonus up to 5 points)
        comm_score = min(len(found_words) * 1.0, 5.0)
        
        if comm_score > 0:
            total_impact += comm_score
            details.append({
                'action': 'Technical Justification',
                'impact': comm_score,
                'type': 'communication',
                'note': f"Strong technical vocabulary used: {', '.join(found_words[:4])}..." if len(found_words) > 0 else ""
            })

        # Cap impact logically
        # Max impact should be roughly proportional to the simulation difficulty
        final_impact = round(min(total_impact, sim['max_impact'] + 5.0), 1)

        return {
            'total_score': final_impact,
            'breakdown': details,
            'skill_impact': {
                sim['target_skill']: final_impact,
                'Technical Communication': comm_score
            },
            'summary': f"Demonstrated { 'excellent' if final_impact > 12 else 'strong' if final_impact > 8 else 'good' } proficiency in {sim['target_skill']}."
        }

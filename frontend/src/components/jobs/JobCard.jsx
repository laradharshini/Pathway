import { CurrencyDollarIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function JobCard({ job, onSelect }) {
    // Determine badge color based on category
    let badgeColor = 'bg-gray-100 text-gray-800';
    if (job.category && job.category.color) {
        if (job.category.color === 'success') badgeColor = 'bg-green-100 text-green-800';
        if (job.category.color === 'warning') badgeColor = 'bg-yellow-100 text-yellow-800';
        if (job.category.color === 'danger') badgeColor = 'bg-red-100 text-red-800';
    }

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-soft hover:shadow-lg transition-all duration-300 p-8 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <span className={classNames("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset mb-3 bg-lime-100 text-lime-800 ring-lime-200")}>
                        {Math.round(job.readiness_score)}% Readiness
                    </span>
                    <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-2 group-hover:text-lavender-600 transition-colors">{job.title}</h3>
                    <div className="flex items-center text-sm font-bold text-gray-500">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        {job.company || 'Confidential'}
                    </div>
                </div>
                {/* Placeholder for company logo if available, or initials */}
                <div className="h-14 w-14 flex-shrink-0 bg-lavender-50 rounded-2xl flex items-center justify-center text-lavender-600 font-black text-xl border border-lavender-100 shadow-sm ml-4">
                    {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                </div>
            </div>

            <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                    <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        {job.location || 'Remote'}
                    </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 font-medium">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    {job.salary || 'Competitive'}
                </div>

                {/* Missing Skills Preview */}
                {job.missing_skills && job.missing_skills.length > 0 ? (
                    <div className="text-xs font-bold text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Gap: {job.missing_skills.slice(0, 3).join(', ')}
                        {job.missing_skills.length > 3 && ` +${job.missing_skills.length - 3}`}
                    </div>
                ) : (
                    <div className="text-xs font-bold text-lime-700 bg-lime-50 px-4 py-3 rounded-xl border border-lime-100 flex items-center">
                        <span className="w-2 h-2 bg-lime-500 rounded-full mr-2"></span>
                        You're a great match!
                    </div>
                )}

                <button
                    onClick={() => onSelect(job)}
                    className="w-full mt-4 bg-[#8b5cf6] text-white hover:bg-[#7c3aed] border border-transparent rounded-xl py-4 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}

const notificationMethods = [
    { id: 'Today', title: 'Today' },
    { id: 'This Week', title: 'This Week' },
    { id: 'This Month', title: 'This Month' },
    { id: 'Custom', title: 'Custom' },
]

export default function Period() {
    return (
        <fieldset>
            <legend className="text-sm/6 font-medium text-gray-900">Period</legend>
            <div className="mt-6 space-y-2">
                {notificationMethods.map((notificationMethod) => (
                    <div key={notificationMethod.id} className="flex items-center">
                        <input
                            defaultChecked={notificationMethod.id === 'email'}
                            id={notificationMethod.id}
                            name="notification-method"
                            type="radio"
                            className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                        />
                        <label htmlFor={notificationMethod.id} className="ml-3 block text-sm/6 font-medium text-gray-900">
                            {notificationMethod.title}
                        </label>
                    </div>
                ))}
            </div>
        </fieldset>
    )
}

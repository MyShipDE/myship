pipeline {
	agent any

	options {
		disableConcurrentBuilds()
	}

	parameters {
		booleanParam(name: 'CLEAN_WORKSPACE', defaultValue: true, description: 'Should clean the WorkSpace before Build?')
	}
}
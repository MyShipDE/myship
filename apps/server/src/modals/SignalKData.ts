export interface SignalKData {

    uuid: string,
    environment: {
        inside: {
            engineRoom: {
                meta: { units: string, description: string },
                value: number,
                timestamp: Date
            }, heating: {
                meta: { units: string, description: string },
                value: number,
                timestamp: Date
            }, temperature: {
                meta: { units: string, description: string },
                value: number,
                timestamp: Date
            }
        },
        outside: {
            temperature: {
                meta: { units: string, description: string },
                value: number,
                timestamp: Date
            }
        }
        wind: {
            angleApparent: {
                meta: { units: string, description: string },
                value: number,
                timestamp: Date
            },
            speedApparent: {
                meta: { units: string, description: string },
                value: number,
                timestamp: Date
            }
        }
    },
    navigation: {
        position: {
            meta: any,
            value: { longitude: number, latitude: number },
            '$source': string,
            timestamp: Date,
            sentence: string
        },
        courseOverGroundTrue: {
            meta: string,
            value: number,
            '$source': string,
            timestamp: Date,
            sentence: string
        },
        speedOverGround: {
            meta: any,
            value: number,
            '$source': string,
            timestamp: Date,
            sentence: string
        },
        magneticVariation: {
            meta: any,
            value: null,
            '$source': string,
            timestamp: Date,
            sentence: string
        },
        magneticVariationAgeOfService: {
            meta: any,
            value: number,
            '$source': string,
            timestamp: Date,
            sentence: string
        },
        datetime: {
            meta: any,
            value: Date,
            '$source': string,
            timestamp: Date,
            sentence: string
        },
        courseOverGroundMagnetic: {
            meta: any,
            value: number,
            '$source': string,
            timestamp: Date,
            sentence: string
        },
        gnss: {
            methodQuality: any,
            satellites: any,
            antennaAltitude: any,
            horizontalDilution: any,
            differentialAge: any,
            differentialReference: any,
            satellitesInView: any
        },
        courseGreatCircle: {
            nextPoint: any,
            previousPoint: any,
            crossTrackError: any,
            bearingTrackTrue: any
        }
    },
    electrical: {
        alternators: [
            revolutions: {
                meta: { units: string, description: string },
                value: number,
                timestamp: Date
            }
        ]
    }


}

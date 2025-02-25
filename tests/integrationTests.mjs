import { describe, it } from "node:test";
import { execa } from "execa";
import assert from "node:assert";

async function runGeoLocUtility(args, flag) {
    let result;
    const splitArgs = args.match(/(?:[^\s"']+|"[^"]*"|'[^']*')/g) || [];
    const cleanedArgs = splitArgs.map(arg => arg.replace(/^["']|["']$/g, ''));
    switch (flag) {
        case '-l':
            result = await execa`npx geoloc-util -l ${cleanedArgs}`;
            break;
        case '--locations':
            result = await execa`npx geoloc-util --locations ${cleanedArgs}`;
            break;

        default:
            result = await execa`npx geoloc-util ${cleanedArgs}`;
            break;
    }

    return JSON.parse(result.stdout)
}

describe('geoloc-util Integration Tests', () => {

    // Without flags, when passed as argument
    it('handles valid city/state input', async () => {
        const expectedResult = [
            {
                country: 'US',
                lat: 43.074761,
                lon: -89.3837613,
                name: 'Madison',
                state: 'Wisconsin'
            }
        ]
        const result = await runGeoLocUtility('"Madison, WI"');
        assert.deepEqual(result, expectedResult)
    });

    it('handles valid zip code', async () => {
        const expectedResult = [
            {
                zip: "53703",
                name: "Madison",
                lat: 43.0775,
                lon: -89.3831,
                country: "US"
            }
        ]
        const result = await runGeoLocUtility('"53703"');
        assert.deepEqual(result, expectedResult)
    });

    it('handles invalid input', async () => {
        const errorMsg = [
            {
                "name": "InvalidCity, XX",
                "error": "Please check input value and try again"
            }
        ]
        const results = await runGeoLocUtility('"InvalidCity, XX"');
        assert.deepEqual(results, errorMsg)
    });

    it('handles mixed valid/invalid inputs', async () => {
        const expected = [
            {
                "name": "Madison",
                "lat": 43.074761,
                "lon": -89.3837613,
                "country": "US",
                "state": "Wisconsin"
            },
            {
                "name": "00000",
                "error": "Please check input value and try again"
            },
            {
                "name": "Invalid",
                "error": "Please check input value and try again"
            }
        ]
        const results = await runGeoLocUtility('"Madison, WI" "00000" "Invalid"');
        assert.deepEqual(results, expected)
    });

    it('handles case-insensitive city/state input', async () => {
        const expectedResult = [
            {
                country: 'US',
                lat: 43.074761,
                lon: -89.3837613,
                name: 'Madison',
                state: 'Wisconsin'
            }
        ]
        const results = await runGeoLocUtility('"madison, wi"');
        assert.deepEqual(results, expectedResult)
    });

    it('handles special characters in city names', async () => {
        const expectedResult = [
            {
                "name": "Saint Louis",
                "lat": 38.6319657,
                "lon": -90.2428756,
                "country": "US",
                "state": "Missouri"
            }
        ]
        const results = await runGeoLocUtility('"St. Louis, MO"');
        assert.deepEqual(results, expectedResult)
    });

    it('handles multiple valid locations', async () => {
        const expected = [
            {
                "name": "New York",
                "lat": 40.7127281,
                "lon": -74.0060152,
                "country": "US",
                "state": "New York"
            },
            {
                "zip": "10001",
                "name": "New York",
                "lat": 40.7484,
                "lon": -73.9967,
                "country": "US"
            },
            {
                "name": "Los Angeles",
                "lat": 34.0536909,
                "lon": -118.242766,
                "country": "US",
                "state": "California"
            }
        ]
        const results = await runGeoLocUtility('"New York, NY" 10001 "Los Angeles, CA"');
        assert.deepEqual(results, expected)
    });

    it('errors with no arguments', async () => {
        try {
            await execa`npx geoloc-util `;
            assert.fail('Should have thrown an error');
        } catch (error) {
            assert.equal(error.exitCode, 1);
            assert.match(error.stderr, /Error: Missing Arguments. Send either locations or zip code either as arguments or with -l or --locations/);
        }
    });

    it('shows help with --help flag', async () => {
        const { stdout } = await execa`npx geoloc-util --help`;
        assert.match(stdout, /Usage/)
        assert.match(stdout, /Options/)
    });


    // When values passed with flags
    it('handles valid city/state input with flag -l', async () => {
        const expectedResult = [
            {
                country: 'US',
                lat: 43.074761,
                lon: -89.3837613,
                name: 'Madison',
                state: 'Wisconsin'
            }
        ]
        const result = await runGeoLocUtility('"Madison, WI"', '-l');
        assert.deepEqual(result, expectedResult)
    });

    it('handles valid zip code with flag --locations', async () => {
        const expectedResult = [
            {
                zip: "53703",
                name: "Madison",
                lat: 43.0775,
                lon: -89.3831,
                country: "US"
            }
        ]
        const result = await runGeoLocUtility('"53703"', "--locations ");
        assert.deepEqual(result, expectedResult)
    });

    it('handles invalid input with flag --locations', async () => {
        const errorMsg = [
            {
                "name": "InvalidCity, XX",
                "error": "Please check input value and try again"
            }
        ]
        const results = await runGeoLocUtility('"InvalidCity, XX"', "--locations");
        assert.deepEqual(results, errorMsg)
    });

    it('handles mixed valid/invalid inputs with flag -l', async () => {
        const expected = [
            {
                "name": "Madison",
                "lat": 43.074761,
                "lon": -89.3837613,
                "country": "US",
                "state": "Wisconsin"
            },
            {
                "name": "00000",
                "error": "Please check input value and try again"
            },
            {
                "name": "Invalid",
                "error": "Please check input value and try again"
            }
        ]
        const results = await runGeoLocUtility('"Madison, WI" "00000" "Invalid"', '-l');
        assert.deepEqual(results, expected)
    });

    it('handles case-insensitive city/state input with flag -l', async () => {
        const expectedResult = [
            {
                country: 'US',
                lat: 43.074761,
                lon: -89.3837613,
                name: 'Madison',
                state: 'Wisconsin'
            }
        ]
        const results = await runGeoLocUtility('"madison, wi"', '-l');
        assert.deepEqual(results, expectedResult)
    });

    it('handles special characters in city names with flag --locations', async () => {
        const expectedResult = [
            {
                "name": "Saint Louis",
                "lat": 38.6319657,
                "lon": -90.2428756,
                "country": "US",
                "state": "Missouri"
            }
        ]
        const results = await runGeoLocUtility('"St. Louis, MO"', "--locations");
        assert.deepEqual(results, expectedResult)
    });

    it('handles multiple valid locations with flag --locations', async () => {
        const expected = [
            {
                "name": "New York",
                "lat": 40.7127281,
                "lon": -74.0060152,
                "country": "US",
                "state": "New York"
            },
            {
                "zip": "10001",
                "name": "New York",
                "lat": 40.7484,
                "lon": -73.9967,
                "country": "US"
            },
            {
                "name": "Los Angeles",
                "lat": 34.0536909,
                "lon": -118.242766,
                "country": "US",
                "state": "California"
            }
        ]
        const results = await runGeoLocUtility('"New York, NY" 10001 "Los Angeles, CA"', "--locations");
        assert.deepEqual(results, expected)
    });

    it('errors with no arguments with flag -l', async () => {
        try {
            await execa`npx geoloc-util -l`;
            assert.fail('Should have thrown an error');
        } catch (error) {
            assert.equal(error.exitCode, 1);
            assert.match(error.stderr, /error: option '-l, --locations <locations...>' argument missing/);
        }
    });
})
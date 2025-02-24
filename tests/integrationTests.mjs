import { describe, it } from "node:test";
import { execa } from "execa";
import assert from "node:assert";

async function runGeoLocUtility(args) {
    const { stdout } = await execa`npx geoloc-util ${args}`;
    return JSON.parse(stdout)
    // return stdout
}

describe('geoloc-util Integration Tests', () => {

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

    it('shows help with --help flag', async () => {
        const { stdout } = await execa`npx geoloc-util --help`;
        assert.match(stdout, /Usage/)
        assert.match(stdout, /Options/)
    });

    it('errors with no arguments', async () => {
        try {
            await execa`npx geoloc-util `;
            assert.fail('Should have thrown an error');
        } catch (error) {
            assert.equal(error.exitCode, 1);
            assert.match(error.stderr, /Missing Arguments.*with -l or --locations/);
        }
    });
})
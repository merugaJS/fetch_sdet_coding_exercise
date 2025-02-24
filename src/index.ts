#!/usr/bin/env ts-node

import { Command } from "commander";
import { GeoLocationAPI, type ErrorResponse, type LocationDetails, type ZipDetails } from "./geoLocationApi";
const program: Command = new Command()


program
    .name('geoloc-util')
    .description('A simple weather Utility')
    .version('1.0.0');

program.option('-l, --locations <locations...>', 'List of locations to process')
    .arguments('[locations...]')
    .action(async (arglocations: string[]) => {
        const { locations } = program.opts();
        const locationsToProcess: string[] = locations || arglocations;
        const processedLocations = locationsToProcess.flatMap(location => {
            return location.split(/ +(?=(?:[^"]*"[^"]*")*[^"]*$)/)
                .map(s => s.replace(/^"|"$/g, '').trim());
        });
        if (processedLocations.length === 0 || processedLocations[0] === '') {
            program.error('Error: Missing Arguments. Send either locations or zip code either as arguments or with -l or --locations');
        }
        await getResult(processedLocations)
    })

program.parse()



async function getResult(locationsToProcess: string[]) {
    const geoApi = new GeoLocationAPI()
    const result: (LocationDetails | ErrorResponse | ZipDetails)[] = [];
    for (const location of locationsToProcess) {
        const cleanLocation = location.replace(/^['"]+|['"]+$/g, '');
        if (/^\d{5}$/.test(cleanLocation)) {
            result.push(await geoApi.getByZipCode(cleanLocation))
        } else {
            result.push(await geoApi.getByLocationName(cleanLocation))
        }
    }
    console.log(JSON.stringify(result, null, 2));

}
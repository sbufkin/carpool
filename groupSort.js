
function groupSort (participants) { //input should be an array of objects with the keys name, morningDepart, afternoonDepart, margin

    let morning = [];
    let afternoon = [];
    let driverScores = {};
    let morningRangeList = {};
    let afternoonRangeList = {}
    
    for (let i = 0; i < participants.length; i++) {
        let morningHigh = participants[i].morningDepart + participants[i].margin;
        let morningLow = participants[i].morningDepart - participants[i].margin;
        let afternoonHigh = participants[i].afternoonDepart + participants[i].margin;
        let afternoonLow = participants[i].afternoonDepart - participants[i].margin;
        morning.push([morningLow, morningHigh]);
        afternoon.push([afternoonLow, afternoonHigh]);
        driverScores[participants[i].name] = participants[i].score;
        morningRangeList[participants[i].name] = [morningLow, morningHigh]
        afternoonRangeList[participants[i].name] = [afternoonLow, afternoonHigh]
    }

    let morningRanges = getRanges(morning);
    let afternoonRanges = getRanges(afternoon); //returns two arrays: the final ranges for the morning and the final ranges for the afternoon

    //now let's work on returning actual groups

    let morningGroups = [];
    let afternoonGroups = [];

    for (let i = 0; i < morningRanges.length; i++) {
        morningGroups.push([])
    }
    for (let i = 0; i < afternoonRanges.length; i++) {
        afternoonGroups.push([])
    }



    for (let i = 0; i < participants.length; i++) { //create groups with names based on the ranges. 
        for (let q = 0; q < morningRanges.length; q++) {
            if (participants[i].morningDepart - participants[i].margin <= morningRanges[q][1] && participants[i].morningDepart + participants[i].margin >= morningRanges[q][0]) {
                
                morningGroups[q].push(participants[i].name);
                
            }
        }
        for (let p = 0; p < afternoonRanges.length; p++) {
            if (participants[i].afternoonDepart - participants[i].margin <= afternoonRanges[p][1] && participants[i].afternoonDepart + participants[i].margin >= afternoonRanges[p][0]) {
                
                afternoonGroups[p].push(participants[i].name);
                
            }
        }
    }

    /*do we need a call to reconcile the group lengths if they're not the same?
    
    
    if (morningGroups.length > afternoonGroups.length) {
        morningGroups = reconcileGroups(morningGroups, afternoonGroups.length)
    }
    else if (afternoonGroups.length > morningGroups.length) {
        afternoonGroups = reconcileGroups(afternoonGroups, morningGroups.length)
    }*/

    let drivers = getDrivers(morningGroups, afternoonGroups, driverScores) //get an array of drivers for the day

    let morningDrivers = getFinalGroups(morningGroups, drivers);
    let afternoonDrivers = getFinalGroups(afternoonGroups, drivers);


    let morningSchedule = getSchedule(morningGroups, morningDrivers, morningRangeList)
    let afternoonSchedule = getSchedule(afternoonGroups, afternoonDrivers, afternoonRangeList)

    let finalSchedule = {}

    finalSchedule['Morning Schedule'] = morningSchedule
    finalSchedule['Afternoon Schedule'] = afternoonSchedule

    return finalSchedule
}

function reconcileGroups (groups, targetNumber) { //if the two groups are different lengths, they need to be evened out


}

function getSchedule (groups, drivers, rangeList) {

    for (let i = 0; i < drivers.length; i++) { //filter drivers out of any group they shouldn't be in
        for (let n = 0; n < groups.length; n++) {
            if (drivers[i][1] !== n) { //if the group we're looking at isn't the one being driven by the current driver
                if (groups[n].includes(drivers[i][0])) { //but the driver is still in the group
                    groups[n] = groups[n].filter( person => person !== drivers[i][0])
                }
            }
        }
    }

    let times = []

    for (let i = 0; i < groups.length; i++) {
        let indivRanges = [];
        for (let q = 0; q < groups[i].length; q++) {
            indivRanges.push(rangeList[groups[i][q]]);
        }
        let finalRange = getRanges(indivRanges)
        let finalTime = (finalRange[0][0] + finalRange[0][1]) / 2
        times.push(finalTime)
    }

    
    let schedule = []

    for (let i = 0; i < drivers.length; i++) {
        let temp = {}
        temp.driver = drivers[i][0];
        temp.group = groups[drivers[i][1]] //morningDrivers[i][1] is the index of the group the driver belongs to
        temp.DepartureTime = times[drivers[i][1]]
        schedule.push(temp)
    }

    return schedule

}

function getFinalGroups (groups, drivers) { //takes a list of rider groups and a list of drivers, and returns a driver/group number pair for each group
    let driverGroups = {}

    for (let i = 0; i < drivers.length; i++) {
        driverGroups[drivers[i]] = [];
    }

    for (let i = 0; i < drivers.length; i++) {
        let count = 0;
        for (n = 0; n < groups.length; n++) {
            if (groups[n].includes(drivers[i])) {
                driverGroups[drivers[i]].push(n)
            }
        }     
    }

    let finalDrivers = [];
    let cont = true;

    while (cont === true) {
        for (let person in driverGroups) {// for each entry in the object
            cont = false//in case this is the last person to push to the array
            if (driverGroups[person].length === 1) {//if the number of groups the person is in is 1
                finalDrivers.push([person, driverGroups[person][0]])//push the person/group no out
                
                for (let other in driverGroups) {//loop through all the other people
                    if (driverGroups[other].includes(driverGroups[person][0])) {//if the group no is in someone else's array
                        driverGroups[other] = driverGroups[other].filter(num => num !== driverGroups[person][0])//filter it out
                        cont = true;//there's at least one person still to go through
                    }
                }
            }
        }
    }

    return finalDrivers;
}

function rangeFinder (individualRanges) {

    let finalGroups = [[individualRanges[0][0], individualRanges[0][1]]];

    for (let i = 1; i < individualRanges.length; i++) { //for every person's  range
        let low = individualRanges[i][0];
        let high = individualRanges[i][1];
        let groupLength = finalGroups.length;
        let match = false;

        for (let q = 0; q < groupLength; q++) { //run through the existing group ranges
            let finalLow = finalGroups[q][0];
            let finalHigh = finalGroups[q][1];

            if (low >= finalLow && low <= finalHigh) { //if the  low fits into a range, adjust that range
                finalGroups[q][0] = low;
                match = true;
                if (high < finalHigh) { //if the high also narrows the range, adjust the high as well
                    finalGroups[q][1] = high;
                }
            }
            
        } 
        if (match === false) { //if a person's range makes it through the whole list of ranges without a match, add it to the list of final ranges
            finalGroups.push([low, high]);
        }

    }

    return finalGroups;
}

function getRanges (individualRanges) {

    let descendingRanges = individualRanges.sort((a, b) => a[0] - b[0])
    let ascendingRanges = [];

    for (let i = descendingRanges.length - 1; i >= 0; i--) {
        ascendingRanges.push(descendingRanges[i])
    }

    let ascendingGroups = [[ascendingRanges[0][0], ascendingRanges[0][1]]];

    for (let i = 1; i < ascendingRanges.length; i++) { //for every person's  range
        let low = ascendingRanges[i][0];
        let high = ascendingRanges[i][1];
        let groupLength = ascendingGroups.length;
        let match = false;

        for (let q = 0; q < groupLength; q++) { //run through the existing group ranges
            let finalLow = ascendingGroups[q][0];
            let finalHigh = ascendingGroups[q][1];

            if (high >= finalLow && high <= finalHigh) { //if the  high fits into a range, adjust that range
                ascendingGroups[q][1] = high;
                match = true;
                if (low > finalLow) { //if the high also narrows the range, adjust the high as well
                    ascendingGroups[q][0] = low;
                }
            }
            
        } 
        if (match === false) { //if a person's range makes it through the whole list of ranges without a match, add it to the list of final ranges
            ascendingGroups.push([low, high]);
        }

    }

    let descendingGroups = [[descendingRanges[0][0], descendingRanges[0][1]]];

    for (let i = 1; i < descendingRanges.length; i++) { //for every person's  range
        let low = descendingRanges[i][0];
        let high = descendingRanges[i][1];
        let groupLength = descendingGroups.length;
        let match = false;

        for (let q = 0; q < groupLength; q++) { //run through the existing group ranges
            let finalLow = descendingGroups[q][0];
            let finalHigh = descendingGroups[q][1];

            if (low >= finalLow && low <= finalHigh) { //if the  low fits into a range, adjust that range
                descendingGroups[q][0] = low;
                match = true;
                if (high < finalHigh) { //if the high also narrows the range, adjust the high as well
                    descendingGroups[q][1] = high;
                }
            }
            
        } 
        if (match === false) { //if a person's range makes it through the whole list of ranges without a match, add it to the list of final ranges
            descendingGroups.push([low, high]);
        }

    }

    let ascendingScore = 0
    
    for (let i = 0; i < ascendingGroups.length; i++) {
        ascendingScore += ascendingGroups[i][1] - ascendingGroups[i][0]
    }

    let descendingScore = 0

    for (let i = 0; i < descendingGroups.length; i++) {
        descendingScore += descendingGroups[i][1] - descendingGroups[i][0]
    }

    if (ascendingScore < descendingScore) {
        return ascendingGroups
    }
    else {
        return descendingGroups
    }

}

function getCombinations (groups) { //generates all possible combinations of a group of drivers

    let length = groups.length;

    let indices = [];
    let drivers = [];

    for (let i = 0; i < length; i++) { //initialize all indices to 0
        indices.push(0);
    }

    let next = 0;

    while (next >= 0) {

        let group = []

        for (let i = 0; i < indices.length; i++) { //loop through the array of indices and push one element from each array to a group
            group.push(groups[i][indices[i]]);
        }

        drivers.push(group) //push that group to the array of groups

        next = length - 1; //start at the the right-most array

        while (next >= 0 && indices[next] + 1 >= groups[next].length) {         
            next--;
        }
        
        indices[next]++;

        for (let i = next + 1; i < length; i++) {
            indices[i] = 0;
        }
                 
    }
    
    for (let i = 0; i < drivers.length; i++) {
        drivers[i].sort()
    }

    return drivers;
    
}

function getDrivers (morningGroups, afternoonGroups, driverScores) { //generates a single set of drivers from an array of all possible morning drivers, all possible evening drivers, and the current driver scores

    let morningCombinations = getCombinations(morningGroups);
    let afternoonCombinations = getCombinations(afternoonGroups);

    let potentialDrivers = []

    for (let i = 0; i < morningCombinations.length; i++) { //finds all combinations of drivers that are in both the morning and the afternoon potential driver sets
        for (let q = 0; q < afternoonCombinations.length; q++) {
            let group = [];
            for (let n = 0; n < morningCombinations[i].length; n++) {
                if (morningCombinations[i][n] === afternoonCombinations[q][n]) {
                    group.push(morningCombinations[i][n])
                }
            }

            if (group.length === morningCombinations[i].length) {
                potentialDrivers.push(group)
            }
        }
    }

    let scoreSums = [];

    for (let i = 0; i < potentialDrivers.length; i++) { //adds up the driver scores of every driver in the group
        let sum = 0;
        for (let q = 0; q < potentialDrivers[i].length; q++) {
            sum += driverScores[potentialDrivers[i][q]]

        }
        scoreSums.push(sum)
    }

    let lowNum = scoreSums[0];

    for (let i = 1; i < scoreSums.length; i++) {//finds the group with the lowest total score
        if (scoreSums[i] < lowNum) {
            lowNum = scoreSums[i]
        }
    }

    let driverIdx = scoreSums.indexOf(lowNum)//returns the index of the group with the lowest score

    return potentialDrivers[driverIdx]
}

let participants = [ {
    name: 'Jeff',
    morningDepart: 450,
    afternoonDepart: 990,
    margin: 15,
    score: 5
},
{
    name: 'Truman',
    morningDepart: 460,
    afternoonDepart: 1000,
    margin: 10,
    score: 7
},
{
    name: 'Sydney',
    morningDepart: 480,
    afternoonDepart: 1020,
    margin: 5,
    score: 0
},
{
    name: 'Caleb',
    morningDepart: 490,
    afternoonDepart: 1010,
    margin: 10,
    score: 3
},
{
    name: 'Mikki',
    morningDepart: 470,
    afternoonDepart: 1005,
    margin: 10,
    score: 1
} ]

console.log(groupSort(participants))
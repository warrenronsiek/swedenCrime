import pandas as pd
import os
import re

files = os.listdir('./crimeReportData')
cwd = os.getcwd()
cnameDict = {'Vapenbrott': 'weaponCrimes', 'Hot-, kränknings- och frihetsbrott': 'kidnappingAndThreats',
             'Våldsbrott ': 'violence', 'Vårdslöshet- och vållandebrott': 'hooliganism',
             'Alkohol- och narkotikabrott': 'drugsAlchohol', 'Stöldbrott': 'theft', 'Bilbrott': 'carCrime',
             'Skadegörelsebrott (inkl. mordbrand)': 'assaultMurder', 'Totalt antal brott': 'total',
             'Vissa trafikbrott': 'specificTrafficCrime'}
monthDict = {'Maj': 'May', 'Apr': 'Apr', 'Aug': 'Aug', 'Dec': 'Dec', 'Feb': 'Feb', 'Jan': 'Jan', 'Jul': 'Jul',
             'Jun': 'Jun', 'Mar': 'Mar', 'Okt': 'Oct', 'Nov': 'Nov', 'Sep': 'Sep'}
dataFrames = []

for file in files:
    temp = pd.read_csv(os.path.join(cwd, 'crimeReportData', file), encoding="iso-8859-10", delimiter=';',
                       names=['region', 'crime', 'year', 'month', 'count', 'per100k', 'nanCol'], skiprows=1)
    temp.drop('nanCol', axis=1, inplace=True)
    temp.crime = temp.crime.apply(lambda x: cnameDict[x])
    temp = temp[temp.crime == 'total']
    temp.drop('crime', axis=1, inplace=True)
    if re.match('.*2016.*', file):
        temp.year = temp.year.apply(lambda x: x[:-6])
    temp.month = temp.month.apply(lambda x: monthDict[x])
    temp['date'] = pd.to_datetime(temp.year.apply(lambda x: str(x)) + temp.month, format='%Y%b')
    temp.drop(['year', 'month', 'count'], axis=1, inplace=True)
    dataFrames.append(temp)

allData = pd.concat(dataFrames, axis=0)
allData.region = allData.region.apply(lambda x: x[:-7])
allData.loc[allData.region == 'Malung-Sälen', 'region'] = 'Malung'
allData.loc[allData.region == 'Upplands Väsby', 'region'] = 'Upplands-Väsby'


pivot = pd.pivot_table(allData, index='region', columns='date', values='per100k')
pivot.reset_index(inplace=True)
colNames = [x.date().__str__() for x in pivot.columns.tolist() if x != 'region']
colNames.insert(0, 'region')
pivot.columns = colNames
pivot.to_csv('crimeByRegion.csv', index=False)
pivot.set_index('region').to_json('crimeByRegion.json', force_ascii=False)

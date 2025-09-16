export type CountryFootprintData = {
  country: string;
  dataQuality: string;
  sdgi: number | null;
  lifeExpectancy: number | null;
  hdi: number | null;
  perCapitaGdp: string | null;
  region: string;
  incomeGroup: string;
  population: number;
  production: {
    cropland: number;
    grazing: number;
    forest: number;
    carbon: number;
    fish: number;
    builtUp: number;
    total: number;
  };
  consumption: {
    cropland: number;
    grazing: number;
    forest: number;
    carbon: number;
    fish: number;
    builtUp: number;
    total: number;
  };
  biocapacity: {
    cropland: number;
    grazing: number;
    forest: number;
    fishing: number;
    builtUp: number;
    total: number;
  };
  deficitOrReserve: number;
  earthsRequired: number;
  countriesRequired: number;
};

export const countryFootprintData: CountryFootprintData[] = [
    {
        country: 'World',
        dataQuality: '',
        sdgi: 58.2,
        lifeExpectancy: 72.0,
        hdi: 0.7,
        perCapitaGdp: '$16.572',
        region: '',
        incomeGroup: '',
        population: 7975.1,
        production: {
            cropland: 0.5,
            grazing: 0.1,
            forest: 0.3,
            carbon: 0.1,
            fish: 0.1,
            builtUp: 1.7,
            total: 2.7,
        },
        consumption: {
            cropland: 0.5,
            grazing: 0.1,
            forest: 0.3,
            carbon: 0.1,
            fish: 0.1,
            builtUp: 1.7,
            total: 2.7,
        },
        biocapacity: {
            cropland: 0.5,
            grazing: 0.2,
            forest: 0.7,
            fishing: 0.1,
            builtUp: 0.1,
            total: 1.5,
        },
        deficitOrReserve: -1.2,
        earthsRequired: 1.8,
        countriesRequired: 1.8,
    },
    {
        country: 'South America',
        dataQuality: '',
        sdgi: 73.4,
        lifeExpectancy: 73.4,
        hdi: 0.76,
        perCapitaGdp: '$15.988',
        region: 'South America',
        incomeGroup: '',
        population: 215.3,
        production: {
            cropland: 0.8,
            grazing: 0.8,
            forest: 0.8,
            carbon: 0.0,
            fish: 0.1,
            builtUp: 0.7,
            total: 3.3,
        },
        consumption: {
            cropland: 0.4,
            grazing: 0.6,
            forest: 0.4,
            carbon: 0.1,
            fish: 0.1,
            builtUp: 0.8,
            total: 2.4,
        },
        biocapacity: {
            cropland: 0.8,
            grazing: 0.8,
            forest: 6.3,
            fishing: 0.2,
            builtUp: 0.1,
            total: 8.1,
        },
        deficitOrReserve: 5.7,
        earthsRequired: 1.6,
        countriesRequired: 0.3,
    },
    {
        country: 'Brazil',
        dataQuality: 'A',
        sdgi: 73,
        lifeExpectancy: 73,
        hdi: 0.76,
        perCapitaGdp: '$15.988',
        region: 'South America',
        incomeGroup: 'UM',
        population: 215.3,
        production: {
            cropland: 0.8,
            grazing: 0.8,
            forest: 0.8,
            carbon: 0.0,
            fish: 0.1,
            builtUp: 0.7,
            total: 3.3,
        },
        consumption: {
            cropland: 0.4,
            grazing: 0.6,
            forest: 0.4,
            carbon: 0.1,
            fish: 0.1,
            builtUp: 0.8,
            total: 2.4,
        },
        biocapacity: {
            cropland: 0.8,
            grazing: 0.8,
            forest: 6.3,
            fishing: 0.2,
            builtUp: 0.1,
            total: 8.1,
        },
        deficitOrReserve: 5.7,
        earthsRequired: 1.6,
        countriesRequired: 0.3,
    },
];

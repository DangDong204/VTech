export const CREATE_SPECIFICATION_FIELDS = [
  { id: 'screenSize', label: 'screenSize' },
  { id: 'screenTech', label: 'screenTech' },
  { id: 'resolution', label: 'resolution' },
  { id: 'operatingSystem', label: 'operatingSystem' },
  { id: 'chip', label: 'chip' },
  { id: 'cpu', label: 'cpu' },
  { id: 'gpu', label: 'gpu' },
  { id: 'ram', label: 'ram' },
  { id: 'storageCapacity', label: 'storageCapacity' },
  { id: 'batteryCapacity', label: 'batteryCapacity' },
  { id: 'chargingTech', label: 'chargingTech' },
  { id: 'backCamera', label: 'backCamera' },
  { id: 'frontCamera', label: 'frontCamera' },
  { id: 'connectivity', label: 'connectivity' },
  { id: 'specialFeature', label: 'specialFeature' },
  { id: 'weight', label: 'weight' }
] as const

export const SPECIFICATION_FIELDS = [
  ...CREATE_SPECIFICATION_FIELDS,
  { id: 'releaseDate', label: 'releaseDate' }
] as const

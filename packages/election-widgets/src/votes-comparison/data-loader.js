import axios from 'axios'
import errors from '@twreporter/errors'
import events from 'events'

/**
 *  @typedef {'error'|'councilMember'|'mayor'|'president'|'legislator'|'referendum'} SupportEventType
 *  @typedef {import('../react-components/votes-comparison/typedef').CouncilMemberElection} CouncilMemberElection
 *  @typedef {import('../react-components/votes-comparison/typedef').CountyMayorElection} CountyMayorElection
 *  @typedef {import('../react-components/votes-comparison/typedef').LegislatorElection} LegislatorElection
 *  @typedef {import('../react-components/votes-comparison/typedef').LegislatorPartyElection} LegislatorPartyElection
 *   @typedef {import('../react-components/votes-comparison/typedef').LegislatorIndigenousElection} LegislatorIndigenousElection
 *  @typedef {import('../react-components/votes-comparison/typedef').PresidentElection} PresidentElection
 *  @typedef {import('../react-components/votes-comparison/typedef').ReferendumElection} ReferendumElection
 */

/**
 *  Example: 抓 2018 年台北市市議員的選舉結果
 *
 *  let dataLoader = new Loader({
 *    apiUrl: 'https://whoareyou-gcs.readr.tw/elections',
 *    version: 'v2',
 *  })
 *
 *  // For server side rendering,
 *  // load data once.
 *  try {
 *    // fetch data once
 *    const data =  await dataLoader.loadCouncilMemberData({
 *      year: '2018',
 *      district: 'taipeiCity',
 *    })
 *  } catch(err) {
 *    // handle error
 *  }
 *
 *  // For client side rendering,
 *  // load data periodically and make React component re-render
 *  useEffect(() => {
 *    const handleError = (err) => {
 *      // do something for loading error
 *    }
 *
 *    const handleData = (data) => {
 *      // call React component `setState`
 *      setState(data)
 *    }
 *
 *    dataLoader.addEventListener('error', handleError)
 *    dataLoader.addEventListener('councilMember', setState)
 *
 *    // after register event listener
 *    // start to load data periodically
 *    dataLoader.loadCouncilMemberData({
 *      year: '2018',
 *      district: 'taipeiCity',
 *      toLoadPeriodically: true,
 *      loadInterval: 300, // seconds
 *    })
 *
 *    return () => {
 *      dataLoader.removeEventListener('error', handleError)
 *      dataLoader.removeEventListener('councilMember', setState)
 *      dataLoader = null
 *    }
 *  }, [])
 *
 */

export default class Loader {
  /** @type events.EventEmitter */
  eventEmitter = null
  apiUrl = 'https://whoareyou-gcs.readr.tw/elections'
  version = 'v2'
  timers = {}

  /**
   *  @constructor
   *  @param {Object} props
   *  @param {string} [props.apiUrl='https://whoareyou-gcs.readr.tw']
   *  @param {string} [props.version=v2]
   */
  constructor({
    apiUrl = 'https://whoareyou-gcs.readr.tw/elections',
    version = 'v2',
  }) {
    this.eventEmitter = new events.EventEmitter()
    this.apiUrl = apiUrl
    this.version = version
  }

  /**
   *  Load data from web service.
   *  @param {Object} props
   *  @param {string} props.year
   *  @param {string} props.type
   *  @param {string} [props.subType]
   *  @param {string} props.district
   *  @throws Error
   *  @returns {Promise<Object>}
   */
  async loadData({ year, type, subtype, district }) {
    try {
      const dataUrl = subtype
        ? `${this.apiUrl}/${this.version}/${year}/${type}/${subtype}/${district}.json`
        : `${this.apiUrl}/${this.version}/${year}/${type}/${district}.json`

      const axiosRes = await axios.get(dataUrl)
      return axiosRes?.data
    } catch (err) {
      const annotatedErr = errors.helpers.annotateAxiosError(err)
      throw annotatedErr
    }
  }

  /**
   *  @typedef {'all'|'normal'|'indigenous'|'mountainIndigenous'|'plainIndigenous'} CouncilMemberType
   */

  /**
   *  Load data from web service.
   *  @param {Object} props
   *  @param {string} props.year
   *  @param {string} props.district - county/city name, see `Loader.electionDistricts` for more info
   *  @param {CouncilMemberType[]} [props.includes=['all']]
   *  @param {number} [props.periodicalLoading=-1]
   *  @throws Error
   *  @returns {Promise<CouncilMemberElection>}
   */
  async loadCouncilMemberDataForElectionMapProject({
    year,
    district,
    includes: _includes = ['all'],
  }) {
    let data
    data = await this.loadData({
      type: 'councilMember',
      year,
      district,
    })

    let includes = _includes

    if (includes?.indexOf('all') > -1) {
      includes = [
        'normal',
        'indigenous',
        'mountainIndigenous',
        'plainIndigenous',
      ]
    }

    const districts = []

    data?.districts?.forEach((d) => {
      if (includes.indexOf(d?.type) > -1) {
        switch (d?.type) {
          case 'plainIndigenous': {
            d.fullDistrictName = `第${d.districtName}選區（平地）`
            districts.push(d)
            break
          }

          case 'mountainIndigenous': {
            d.fullDistrictName = `第${d.districtName}選區（山地）`
            districts.push(d)
            break
          }

          case 'indigenous':
          case 'normal': {
            d.fullDistrictName = `第${d.districtName}選區`
            districts.push(d)
            break
          }
          default: {
            // do nothing
          }
        }
      }
    })
    data.districts = districts

    return data
  }

  /**
   *  Load data from web service.
   *  @param {Object} props
   *  @param {string} props.year
   *  @param {string} props.district - county/city name, see `Loader.electionDistricts` for more info
   *  @param {boolean} [props.toLoadPeriodically=false]
   *  @param {number} [props.loadInterval] - available only when `toLoadPeriodically=true`, and its value must be greater than 30. Unit is second.
   *  @throws Error
   *  @returns {Promise<void|CouncilMemberElection>}
   */
  loadCouncilMemberData({
    year,
    district,
    toLoadPeriodically = false,
    loadInterval,
  }) {
    if (toLoadPeriodically) {
      return this.loadDataPeriodically({
        type: 'councilMember',
        year,
        district,
        interval: loadInterval,
      })
    }

    return this.loadData({
      type: 'councilMember',
      year,
      district,
    })
  }

  /**
   *  @param {Object} props
   *  @param {string} props.year
   *  @param {'plainIndigenous' | 'mountainIndigenous' | 'party' | 'district'} props.subtype
   *  @param {string} [props.district] - available only when `type` is `district`
   *  @param {boolean} [props.toLoadPeriodically=false]
   *  @param {number} [props.loadInterval] - available only when `toLoadPeriodically=true`, and its value must be greater than 30. Unit is second.
   *  @throws Error
   *  @returns {Promise<void|LegislatorElection|LegislatorPartyElection|LegislatorIndigenousElection}
   */
  loadLegislatorData({
    year,
    subtype,
    district: _district,
    toLoadPeriodically = false,
    loadInterval,
  }) {
    let district = ''
    switch (subtype) {
      case 'party':
      case 'plainIndigenous':
      case 'mountainIndigenous': {
        district = 'all'
        break
      }
      case 'district': {
        district = _district
        break
      }
      case 'recall': {
        district = 'all'
        break
      }
      default: {
        throw new Error(
          'subtype should be either "plainIndigenous", "mountainIndigenous", "party" or "district"'
        )
      }
    }
    if (toLoadPeriodically) {
      return this.loadDataPeriodically({
        type: 'legislator',
        subtype,
        year,
        district,
        interval: loadInterval,
      })
    }

    return this.loadData({
      type: 'legislator',
      subtype,
      year,
      district,
    })
  }

  /**
   *  @param {Object} props
   *  @param {string} props.year
   *  @param {string} props.recallType
   *  @param {string} props.district
   *  @throws Error
   *  @returns {Promise<void|LegislatorElection|LegislatorPartyElection|LegislatorIndigenousElection}
   */
  loadRecallData({ year, recallType = 'recall', district }) {
    return this.loadData({
      year,
      type: recallType,
      district: `district/${district}`,
    })
  }
  /**
   *  @param {Object} props
   *  @param {string} props.year
   *  @param {boolean} [props.toLoadPeriodically=false]
   *  @param {number} [props.loadInterval] - available only when `toLoadPeriodically=true`, and its value must be greater than 30. Unit is second.
   *  @throws Error
   *  @returns {Promise<void|PresidentElection>}
   */
  loadPresidentData({ year, toLoadPeriodically = false, loadInterval }) {
    if (toLoadPeriodically) {
      return this.loadDataPeriodically({
        type: 'president',
        year,
        district: 'all',
        interval: loadInterval,
      })
    }
    return this.loadData({
      type: 'president',
      year,
      district: 'all',
    })
  }

  /**
   *  @param {Object} props
   *  @param {string} props.year
   *  @param {boolean} [props.toLoadPeriodically=false]
   *  @param {number} [props.loadInterval] - available only when `toLoadPeriodically=true`, and its value must be greater than 30. Unit is second.
   *  @throws Error
   *  @returns {Promise<void|CountyMayorElection>}
   */
  loadMayorData({ year, toLoadPeriodically = false, loadInterval }) {
    if (toLoadPeriodically) {
      return this.loadDataPeriodically({
        type: 'mayor',
        year,
        district: 'all',
        interval: loadInterval,
      })
    }
    return this.loadData({
      type: 'mayor',
      year,
      district: 'all',
    })
  }

  /**
   *  @param {Object} props
   *  @param {string} props.year
   *  @param {boolean} [props.toLoadPeriodically=false]
   *  @param {number} [props.loadInterval] - available only when `toLoadPeriodically=true`, and its value must be greater than 30. Unit is second.
   *  @throws Error
   *  @returns {Promise<void|ReferendumElection>}
   */
  loadReferendumData({ year, toLoadPeriodically = false, loadInterval }) {
    if (toLoadPeriodically) {
      return this.loadDataPeriodically({
        type: 'referendum',
        year,
        district: 'all',
        interval: loadInterval,
      })
    }
    return this.loadData({
      type: 'referendum',
      year,
      district: 'all',
    })
  }

  /**
   *  Load data from web service,
   *  and take advantage of event emitter to pass data to the event subscribers.
   *  This function will take `props.interval` first.
   *  If `props.interval` not provided, the function
   *  will take web service response header `Cache-Control`'s `max-age` into account.
   *  Value of `max-age` will be used to `setTimeout` a timer.
   *  When time is up, the timer will load data,
   *  and emit it again.
   *  if `max-age` is not defined, the default timeout will be 3600.
   *
   *  @param {Object} props
   *  @param {string} props.year
   *  @param {string} props.type
   *  @param {string} props.district
   *  @param {number} [props.interval]
   *  @returns {Promise<void>}
   */
  async loadDataPeriodically({ year, type, district, interval }) {
    const url = `${this.apiUrl}/${this.version}/${year}/${type}/${district}.json`
    let axiosRes
    let annotatedErr
    try {
      axiosRes = await axios.get(url)
    } catch (err) {
      annotatedErr = errors.helpers.annotateAxiosError(err)
      annotatedErr = errors.helpers.wrap(
        annotatedErr,
        'DataLoaderError',
        `Error to load data from ${url}`
      )
    }

    const minimumInterval = 0 // seconds
    const defaultMaxAge = 3600 // seconds
    let maxAge = defaultMaxAge
    if (annotatedErr) {
      this.eventEmitter.emit('error', annotatedErr)
    } else {
      this.eventEmitter.emit(type, axiosRes?.data)

      const cacheControl = axiosRes?.headers?.['cache-control']
      maxAge =
        interval > minimumInterval
          ? interval
          : parseInt(cacheControl.match(/max-age=([\d]+)/)?.[1])
      if (isNaN(maxAge)) {
        maxAge = defaultMaxAge
      }
    }

    this.timers[type] = setTimeout(async () => {
      await this.loadDataPeriodically({ year, type, district, interval })
    }, maxAge * 1000)
  }

  clearTimer(eventType) {
    if (this.timers?.hasOwnProperty(eventType)) {
      clearTimeout(this.timers[eventType])
      delete this.timers[eventType]
    }
  }

  /**
   *  @param {SupportEventType} eventType
   *  @param {(...args: any[]) => void} cb
   *  @returns void
   */
  addEventListener(eventType, cb) {
    if (Loader.supportTypes.indexOf(eventType) > -1) {
      this.eventEmitter.addListener(eventType, cb)
    }
  }

  /**
   *  @param {SupportEventType} eventType
   *  @param {(...args: any[]) => void} cb
   *  @returns void
   */
  removeEventListener(eventType, cb) {
    if (Loader.supportTypes.indexOf(eventType) > -1) {
      this.eventEmitter.removeListener(eventType, cb)

      if (this.eventEmitter.listenerCount(eventType) === 0) {
        this.clearTimer(eventType)
      }
    }
  }
}

// Event support types could be added or removed if necessarily
Loader.supportTypes = [
  'error',
  'councilMember',
  'mayor',
  'president',
  'legislator',
  'referendum',
]
Loader.electionTypes = [
  'president', // 總統
  'legislator', // 立法委員
  'mayor', // 縣市首長
  'councilMember', // 縣市議員
]
Loader.electionYears = [
  '1994',
  '1997',
  '1998',
  '2001',
  '2002',
  '2005',
  '2006',
  '2009',
  '2010',
  '2012',
  '2014',
  '2016',
  '2018',
  '2020',
  '2022',
  '2024',
]
Loader.electionDistricts = [
  'taipeiCity',
  'newTaipeiCity',
  'taoyuanCity',
  'taichungCity',
  'tainanCity',
  'kaohsiungCity',
  'hsinchuCounty',
  'miaoliCounty',
  'changhuaCounty',
  'nantouCounty',
  'yunlinCounty',
  'chiayiCounty',
  'pingtungCounty',
  'yilanCounty',
  'hualienCounty',
  'taitungCounty',
  'penghuCounty',
  'kinmenCounty',
  'lienchiangCounty',
  'keelungCity',
  'hsinchuCity',
  'chiayiCity',
]

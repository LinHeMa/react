/**
 *  @typedef {import('./typedef').District} District
 *  @typedef {import('./typedef').Election} Election
 *  @typedef {import('./typedef').ReferendumElection} ReferendumElection
 *  @typedef {import('./typedef').PresidentElection} PresidentElection
 *  @typedef {import('./typedef').LegislatorElection} LegislatorElection
 *  @typedef {import('./typedef').LegislatorPartyElection} LegislatorPartyElection
 *  @typedef {import('./typedef').LegislatorIndigenousElection} LegislatorIndigenousElection
 *  @typedef {import('./manager').DataManager} DataManager
 */

import React, { useEffect, useState, useMemo } from 'react' // eslint-disable-line
import Selector from './selector'
import breakpoint from './breakpoint'
import styled, { ThemeProvider } from 'styled-components'
import List from './list'
import themeObj from './theme'
import { dataManagerFactory } from './manager'

const dirstrictTypeEnum = {
  normal: 'normal',
  indigenous: 'indigenous',
  plainIndigenous: 'plainIndigenous',
  mountainIndigenous: 'mountainIndigenous',
}

const tabEnum = dirstrictTypeEnum

const StyledTab = styled.div`
  cursor: pointer;
  font-weight: 700;
  color: ${
    /**
     *  @param {Object} props
     *  @param {boolean} props.active
     *  @param {Object} [props.theme]
     */
    (props) =>
      props.active ? props.theme.tab.color.active : props.theme.tab.color.normal
  };

  ${(props) => {
    switch (props.theme?.device) {
      case 'mobile':
        return `
          min-width: 128px;
          font-size: 16px;
          margin-right: 16px;
          margin-left: 16px;
        `
      case 'rwd':
      default: {
        return `
          @media ${breakpoint.devices.tablet} {
            min-width: 120px;
            font-size: 24px;
            line-height: 130%;
            margin-right: 40px;
            margin-left: 40px;
          }

          @media ${breakpoint.devices.tabletBelow} {
            min-width: 80px;
            font-size: 16px;
            margin-right: 16px;
            margin-left: 16px;
          }
        `
      }
    }
  }}
`

const StyledTabBorder = styled.div`
  width: 0px;
  height: 16px;
  border-right: 2px solid black;

  @media ${breakpoint.devices.tablet} {
    height: 20px;
  }
`

const StyledTabs = styled.div`
  text-align: center;
  margin-bottom: 48px;

  > div {
    display: inline-block;
  }

  ${(props) => {
    switch (props.theme?.device) {
      case 'mobile': {
        return `
          margin-top: 28px;
        `
      }
      case 'rwd':
      default: {
        return `
          @media ${breakpoint.devices.mobileS} {
            margin-top: 28px;
          }

          @media ${breakpoint.devices.tablet} {
            margin-top: 38px;
          }

          @media ${breakpoint.devices.laptop} {
            margin-top: 48px;
          }
        `
      }
    }
  }}
`

const StyledSelector = styled(Selector)`
  margin: 40px auto 20px auto;

  ${(props) => {
    switch (props.theme?.device) {
      case 'mobile': {
        return `
          width: 256px;
        `
      }
      case 'rwd':
      default: {
        return `
          @media ${breakpoint.devices.laptop} {
            display: none;
          }

          @media ${breakpoint.devices.laptopBelow} and ${breakpoint.devices.tablet} {
            width: 288px;
          }

          @media ${breakpoint.devices.tabletBelow} {
            width: 256px;
          }
        `
      }
    }
  }}
`

const StyledList = styled(List)``

const Container = styled.div`
  width: 100%;

  * {
    box-sizing: border-box;
  }

  background-color: ${({ theme }) =>
    theme?.container?.backgroundColor
      ? theme?.container?.backgroundColor
      : '#fff8f3'};
  padding-bottom: 60px;

  ${StyledList} {
    margin-left: auto;
    margin-right: auto;
  }

  ${(props) => {
    switch (props.theme?.device) {
      case 'mobile': {
        return ''
      }
      case 'rwd':
      default: {
        return `
          @media ${breakpoint.devices.laptop} {
            min-height: 100vh;
          }
        `
      }
    }
  }}
`

const Header = styled.header`
  display: ${({ theme }) => theme.header.display};
  ${(props) => {
    const baseCss = `
      border-top: 4px solid black;
      border-bottom: 4px solid black;
      margin-bottom: 48px;

      h3 {
        line-height: 120%;
        font-weight: 700;
        margin: 0;
      }
      background-color: ${props.theme.title.bottomBlock.backgroundColor};
      h3:first-child {
        background-color: ${props.theme.title.topBlock.backgroundColor};
        color: ${props.theme.title.topBlock.color};
      }
      h3:last-child {
        color: ${props.theme.title.bottomBlock.color};
      }
    `
    const mobileCss = `
      h3 {
        font-size: 24px;
        display: block;
        text-align: center;
        padding: 12px 0;
      }

      h3:last-child {
        border-top: 4px solid black;
      }
    `
    switch (props.theme?.device) {
      case 'mobile': {
        return `
          ${baseCss}
          ${mobileCss}
        `
      }
      case 'rwd':
      default: {
        return `
          ${baseCss}
          @media ${breakpoint.devices.tablet} {
            h3 {
              padding: 25px 40px;
              display: inline-block;
              font-size: 32px;
            }
            h3:last-child {
              border-left: 4px solid black;
            }
          }

          @media ${breakpoint.devices.tablet} and ${breakpoint.devices.laptopBelow} {
            h3:first-child {
              padding-left: 38px;
              padding-right: 38px;
            }
          }

          @media ${breakpoint.devices.laptop} and ${breakpoint.devices.laptopLBelow} {
            h3:first-child {
              padding-left: 82px;
              padding-right: 82px;
            }
          }

          @media ${breakpoint.devices.laptopL} {
            h3:first-child {
              padding-left: 106px;
              padding-right: 106px;
            }
          }

          @media ${breakpoint.devices.tabletBelow} {
            ${mobileCss}
          }
        `
      }
    }
  }};
`

/**
 *  @param {Object} props
 *  @param {string} [props.className]
 *  @param {string} props.year
 *  @param {string} props.title
 *  @param {District[]} [props.districts=[]]
 *  @param {string} [props.scrollTo] - the first row with the district name to scroll to
 *  @param {OnChange} [props.onChange=()=>{}]
 *  @returns {React.ReactElement}
 */
export function CouncilMember({
  className,
  districts: allDistricts = [],
  year,
  title,
  scrollTo,
  onChange = () => {},
}) {
  const [tab, setTab] = useState(tabEnum.normal)

  const separatedDistricts = useMemo(() => {
    return {
      indigenous: allDistricts.filter(
        (d) => d.type === dirstrictTypeEnum.indigenous
      ),
      plainIndigenous: allDistricts.filter(
        (d) => d.type === dirstrictTypeEnum.plainIndigenous
      ),
      mountainIndigenous: allDistricts.filter(
        (d) => d.type === dirstrictTypeEnum.mountainIndigenous
      ),
      normal: allDistricts.filter((d) => d.type === dirstrictTypeEnum.normal),
    }
  }, [allDistricts])

  const showTabs = separatedDistricts.normal?.length !== allDistricts.length
  let tabsJsx = null
  let districts = separatedDistricts?.[tab]

  /**
   *  @callback OnTab
   *  @param {string} tab - value could be 'normal', 'indigenous', 'plainIndigenous' or 'mountainIndigenous'
   *  @returns {void}
   */
  /**
   *  @type {OnTab}
   */
  const onTab = (t) => {
    setTab(t)
    setDistrictName(separatedDistricts?.[t]?.[0]?.districtName)
    onChange('tab', t)
  }

  tabsJsx = showTabs ? (
    <StyledTabs>
      <StyledTab
        active={tab === tabEnum.normal}
        onClick={() => onTab(tabEnum.normal)}
      >
        區域
      </StyledTab>
      {separatedDistricts.indigenous.length > 0 ? (
        <>
          <StyledTabBorder />
          <StyledTab
            active={tab === tabEnum.indigenous}
            onClick={() => onTab(tabEnum.indigenous)}
          >
            原住民
          </StyledTab>
        </>
      ) : null}
      {separatedDistricts.plainIndigenous.length > 0 ? (
        <>
          <StyledTabBorder />
          <StyledTab
            active={tab === tabEnum.plainIndigenous}
            onClick={() => onTab(tabEnum.plainIndigenous)}
          >
            平地原住民
          </StyledTab>
        </>
      ) : null}
      {separatedDistricts.mountainIndigenous.length > 0 ? (
        <>
          <StyledTabBorder />
          <StyledTab
            active={tab === tabEnum.mountainIndigenous}
            onClick={() => onTab(tabEnum.mountainIndigenous)}
          >
            山地原住民
          </StyledTab>
        </>
      ) : null}
    </StyledTabs>
  ) : null

  const dataManager = dataManagerFactory().newDataManager({
    districts,
    type: 'councilMember',
    year,
    title,
  })

  /** @type {string[]} */
  const options = districts.map(
    (d) => d.fullDistrictName || dataManager.genFullDistrictName(d.districtName)
  )
  const [districtName, setDistrictName] = useState(scrollTo || options?.[0])

  useEffect(() => {
    setDistrictName(scrollTo || options?.[0])
  }, [scrollTo, districts])

  useEffect(() => {
    setTab(tabEnum.normal)
  }, [allDistricts])

  return (
    <Container className={className}>
      <Header>
        <h3>{year}</h3>
        <h3>{title}</h3>
      </Header>
      {tabsJsx}
      <StyledSelector
        options={options}
        defaultValue={districtName}
        onSelect={(n) => {
          setDistrictName(n)
          if (typeof n === 'string') {
            onChange('selector', n)
          }
        }}
      />
      <StyledList dataManager={dataManager} scrollTo={districtName} />
    </Container>
  )
}

/**
 *  @callback OnChange
 *  @param {'selector'|'tab'} type
 *  @param {string} value - selector option or tab name
 */

/**
 *  @param {Object} props
 *  @param {string} [props.className]
 *  @param {Election | ReferendumElection | PresidentElection | LegislatorPartyElection | LegislatorIndigenousElection | LegislatorElection } props.election
 *  @param {'mobile'|'rwd'} [props.device='rwd']
 *  @param {'openRelations'|'electionMap'|'mnewsElection2022'} [props.theme='openRelations']
 *  @param {string} [props.stickyTopOffset]
 *  @param {OnChange} [props.onChange]
 *  @param {string} [props.scrollTo] - the first row with the district name to scroll to
 */
export default function EVC({
  className,
  election,
  device = 'rwd',
  theme = 'openRelations',
  stickyTopOffset,
  scrollTo,
  onChange,
}) {
  const dataManager = dataManagerFactory().newDataManager(election)
  switch (election?.type) {
    case 'councilMember':
      return (
        <ThemeProvider
          theme={Object.assign({ device, stickyTopOffset }, themeObj[theme])}
        >
          {theme === 'electionMap' ? (
            <_EVC
              key={election.title + election.type + election.year}
              className={className}
              dataManager={dataManager}
              scrollTo={scrollTo}
              onChange={onChange}
            />
          ) : (
            <CouncilMember
              className={className}
              districts={election?.districts}
              year={election?.year}
              title={election?.title}
              scrollTo={scrollTo}
              onChange={onChange}
            />
          )}
        </ThemeProvider>
      )
    case 'legislator':
    case 'legislator-district':
    case 'legislator-mountainIndigenous':
    case 'legislator-plainIndigenous':
    case 'legislator-party':
    case 'legislator-recall':
    case 'mayor':
    case 'referendum':
    case 'president': {
      return (
        <ThemeProvider
          theme={Object.assign({ device, stickyTopOffset }, themeObj[theme])}
        >
          <_EVC
            key={election.title + election.type + election.year}
            className={className}
            dataManager={dataManager}
            scrollTo={scrollTo}
            onChange={onChange}
          />
        </ThemeProvider>
      )
    }
    default: {
      return null
    }
  }
}

/**
 *  @callback RenderFullOption
 *  @param {string} option
 *  @returns {string}
 */

/**
 *  @param {Object} props
 *  @param {string} [props.className]
 *  @param {DataManager} props.dataManager
 *  @param {string} [props.scrollTo] - the first row with the district name to scroll to
 *  @param {OnChange} [props.onChange=() => {}]
 *  @returns {React.ReactElement}
 */
function _EVC({ className, dataManager, scrollTo, onChange = () => {} }) {
  /** @type {Election} */
  const data = dataManager.getData()
  const options = data?.districts.map(
    (c) => c.fullDistrictName || dataManager.genFullDistrictName(c.districtName)
  )

  const [districtName, setDistrictName] = useState(scrollTo || options?.[0])

  useEffect(() => {
    setDistrictName(scrollTo || options?.[0])
  }, [scrollTo, data])

  return (
    <Container className={className}>
      <Header>
        <h3>{data?.year}</h3>
        <h3>{data?.title}</h3>
      </Header>
      <StyledSelector
        options={options}
        defaultValue={districtName}
        onSelect={(n) => {
          setDistrictName(n)
          if (typeof n === 'string') {
            onChange('selector', n)
          }
        }}
      />
      <StyledList dataManager={dataManager} scrollTo={districtName} />
    </Container>
  )
}

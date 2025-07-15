import React, { useState } from 'react' // eslint-disable-line
import breakpoint from './breakpoint'
import styled from 'styled-components'
import { AnonymousIcon, ElectedIcon } from './icons'

/**
 *  @typedef {import('./typedef').Election} Election
 *  @typedef {import('./typedef').CouncilMemberElection} CouncilMemberElection
 *  @typedef {import('./typedef').ReferendumElection} ReferendumElection
 *  @typedef {import('./typedef').LegislatorPartyElection} LegislatorPartyElection
 *  @typedef {import('./typedef').LegislatorIndigenousElection} LegislatorIndigenousElection
 *  @typedef {import('./typedef').PresidentElection} PresidentElection
 *  @typedef {import('./typedef').Proposition} Proposition
 *  @typedef {import('./typedef').Candidate} Candidate
 *  @typedef {import('./typedef').Entity} Entity
 *  @typedef {import('./typedef').District} District
 *  @typedef {import('./typedef').LegislatorParty} LegislatorParty
 *  @typedef {import('./typedef').PresidentCandidate} PresidentCandidate
 */

/**
 *  @typedef {string} Head
 *
 *  @typedef {Object} CellEntity
 *  @property {string} [label]
 *  @property {string} [href]
 *  @property {React.ReactElement} [imgJsx]
 *  @property {boolean} [multiLines=false]
 *
 *  @typedef {CellEntity[]} Cell - Table cell. A cell contains multiple entities
 *
 *  @typedef {Object} Row
 *  @property {string} id
 *  @property {Cell[]} cells
 *  @property {string} [group]
 */

const ImgBlock = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    width: 32px;
    height: 32px;
    object-fit: cover;
    border-radius: 50%;
    overflow: hidden;
  }

  ${(props) => {
    switch (props.theme?.device) {
      case 'mobile': {
        return `
          @media ${breakpoint.devices.laptop} {
            img, svg {
              width: 32px;
              height: 32px;
            }
          }
        `
      }

      case 'rwd':
      default: {
        return `
          @media ${breakpoint.devices.laptop} {
            img, svg {
              width: 40px;
              height: 40px;
            }
          }
        `
      }
    }
  }}
`

export class DataManager {
  /**
   *  @param {Object} data
   */
  constructor(data) {
    this.data = data
    this.rows = []
    this.head = []
  }

  /**
   *  @return {Object} data
   */
  getData() {
    return this.data
  }

  /**
   *  @returns {Head[]}
   */
  buildListHead() {
    console.warn('Method `buildListHead` needs to be implemented.')
    return this.head
  }

  /**
   *  @returns {Row[]}
   */
  buildListRows() {
    console.warn('Method `buildListRows` needs to be implemented.')
    return this.rows
  }

  /**
   *  @param {Entity[]} entities
   *  @returns {CellEntity[]}
   */
  buildNameCell(entities) {
    return entities?.map((entity) => {
      return {
        label: entity?.label,
        href: entity?.href,
        imgJsx: <CandidateImg imgSrc={entity?.imgSrc} />,
      }
    })
  }

  /**
   *  @param {Entity[]} entities
   *  @returns {CellEntity[]}
   */
  buildPartyCell(entities) {
    return entities?.map((entity) => {
      return {
        label: entity?.label || '無',
        href: entity?.href,
        imgJsx: entity?.imgSrc ? (
          <ImgBlock>
            <img src={entity.imgSrc} />
          </ImgBlock>
        ) : null,
      }
    })
  }

  /**
   *  @param {string} id
   *  @returns {Row}
   */
  // eslint-disable-next-line no-unused-vars
  getRowById(id) {
    console.warn('Method `getRowById` needs to be implemented.')
    return {
      id: '',
      cells: [],
      group: '',
    }
  }

  /**
   *  @param {string} dn
   *  @returns {Row}
   */
  // eslint-disable-next-line no-unused-vars
  findRowByDistrictName(dn) {
    console.warn('Method `findRowByValue` needs to be implemented.')
    return {
      id: '',
      cells: [],
      group: '',
    }
  }

  /**
   *  @param {string} dn
   *  @returns {string}
   */
  genFullDistrictName(dn) {
    return dn
  }
}

function CandidateImg({ imgSrc }) {
  const [errored, setErrored] = useState(false)
  return (
    <ImgBlock>
      {imgSrc && !errored ? (
        <img src={imgSrc} onError={() => setErrored(true)} />
      ) : (
        <AnonymousIcon />
      )}
    </ImgBlock>
  )
}

export class CouncilMemberDataManager extends DataManager {
  /**
   *  @override
   *  @returns {Head[]}
   */
  buildListHead() {
    // built already, therefore return the built one
    if (this.head.length > 0) {
      return this.head
    }
    this.head = ['地區', '號次', '姓名', '推薦政黨', '得票數', '得票率', '當選']
    return this.head
  }

  /**
   *  @param {Candidate} c
   *  @returns {Cell[]}
   */
  buildRowFromCandidate(c) {
    const tksRate = c?.tksRate ?? c?.voteRate
    return [
      // 號次
      [
        {
          label: `${c?.candNo ?? c?.number ?? '-'}`,
        },
      ],
      // 姓名
      this.buildNameCell([c?.name]),
      // 政黨
      this.buildPartyCell([c?.party]),
      // 得票數
      [
        {
          label: c?.tks?.toLocaleString() ?? c?.votes?.toLocaleString() ?? '-',
        },
      ],
      // 得票率
      [
        {
          label: typeof tksRate === 'number' ? `${tksRate}%` : '-',
        },
      ],
      // 當選
      [
        {
          imgJsx: c?.candVictor || c?.elected ? <ElectedIcon /> : null,
        },
      ],
    ]
  }

  /**
   *  @override
   */
  genFullDistrictName(dn) {
    return `第${dn}選區`
  }

  /**
   *  @override
   *  @returns {Row[]}
   */
  buildListRows() {
    // built already, therefore return the built one
    if (this.rows.length > 0) {
      return this.rows
    }

    this.data?.districts?.forEach((d) => {
      d?.candidates?.forEach((c, cIdx) => {
        /** @type {Row} */
        const row = {
          id: '',
          cells: [],
          group: '',
        }

        // `districtName` 為 (1)下拉選單內容 (2)「地區」欄內容 (3)scrollTo 對應的 id 資訊
        /** @type {string} */
        let districtName =
          d.fullDistrictName || this.genFullDistrictName(d.districtName) || ''
        row.id = `${districtName}-${cIdx}` // data for `data-row-id`
        row.group = districtName

        //「地區」欄-內容小標（除了 cIdx[0] 外的都不顯示小標）
        /** @type {string} */
        let areaLabel = ''
        if (cIdx === 0) {
          areaLabel = districtName
        }
        row.cells = this.buildRowFromCandidate(c)
        row.cells.unshift([{ label: areaLabel }])
        this.rows.push(row)
      })
    })
    return this.rows
  }

  /**
   *  @override
   *  @param {string} districtName
   *  @returns {Row}
   */
  findRowByDistrictName(districtName = '第01選區') {
    return this.rows.find((r) => {
      return r.group === districtName
    })
  }
}

export class CountyMayorDataManager extends CouncilMemberDataManager {
  /**
   *  @override
   */
  genFullDistrictName(dn) {
    return dn
  }
}

export class LegislatorDataManager extends CouncilMemberDataManager {}

export class RecallDataManager extends LegislatorDataManager {
  constructor(data) {
    super(data)
    this.buildListHead()
    this.buildListRows()
  }

  /**
   * @override
   * @returns {Head[]}
   */
  buildListHead() {
    if (this.head.length > 0) return this.head
    this.head = [
      '地區',
      '姓名',
      '政黨',
      '同意數',
      '不同意數',
      '同意率',
      '不同意率',
      '是否通過',
    ]
    return this.head
  }

  /**
   *  @override
   *  @param {Candidate & {agreeTks: number, disagreeTks: number, agreeRate: number, disagreeRate: number}} candidate
   *  @returns {Cell[]}
   */
  buildRowFromCandidates(candidate) {
    // This method creates all cells except for the 'district' one.
    return [
      // 姓名
      this.buildNameCell([candidate?.name]),
      // 政黨
      this.buildPartyCell([candidate?.party]),
      // 同意數
      [{ label: candidate?.agreeTks?.toLocaleString() ?? '-' }],
      // 不同意數
      [{ label: candidate?.disagreeTks?.toLocaleString() ?? '-' }],
      // 同意率
      [
        {
          label:
            typeof candidate?.agreeRate === 'number'
              ? `${candidate?.agreeRate}%`
              : '-',
        },
      ],
      // 不同意率
      [
        {
          label:
            typeof candidate?.disagreeRate === 'number'
              ? `${candidate?.disagreeRate}%`
              : '-',
        },
      ],
      // 是否通過
      [
        {
          label: candidate?.adptVictor === 'Y' ? '通過' : '不通過',
        },
      ],
    ]
  }

  /**
   * @override
   * @returns {Row[]}
   */
  buildListRows() {
    if (this.rows && this.rows.length > 0) {
      return this.rows
    }
    const newRows = []
    const districts = this.data.districts || []

    for (const district of districts) {
      for (const [cIdx, candidate] of district.candidates.entries()) {
        const row = {
          id: `${district.districtName}-${candidate.name.label}`,
          group: district.districtName,
          cells: this.buildRowFromCandidates(candidate),
        }

        const areaLabel = cIdx === 0 ? district.districtName : ''
        row.cells.unshift([{ label: areaLabel }])

        newRows.push(row)
      }
    }
    this.rows = newRows
    return this.rows
  }
}

export class LegislatorPartyDataManager extends DataManager {
  /**
   *  @override
   *  @param {LegislatorPartyElection} data
   */
  constructor(data) {
    super(data)
    this.districts = [{ districtName: '全國' }]
  }

  /**
   *  @return {LegislatorPartyElection & { districts: {districtName: string}[] }} data
   */
  getData() {
    return {
      ...this.data,
      districts: [
        {
          districtName: '全國',
        },
      ],
    }
  }

  /**
   *  @override
   *  @returns {Head[]}
   */
  buildListHead() {
    // built already, therefore return the built one
    if (this.head.length > 0) {
      return this.head
    }
    this.head = ['地區', '號次', '政黨', '得票數', '得票率', '當選席次']
    return this.head
  }

  /**
   *  @param {LegislatorParty} p
   *  @returns {Cell[]}
   */
  buildRowFromParty(p) {
    return [
      // 號次
      [
        {
          label: `${p?.candNo ?? '-'}`,
        },
      ],
      // 政黨
      this.buildPartyCell([p?.party]),
      // 得票數
      [
        {
          label: p?.tks?.toLocaleString() ?? '-',
        },
      ],
      // 得票率
      [
        {
          label: typeof p?.tksRate1 === 'number' ? `${p?.tksRate1}%` : '-',
        },
      ],
      // 當選席次
      [
        {
          label: p?.seats?.toLocaleString() ?? '-',
        },
      ],
    ]
  }

  /**
   *  @override
   *  @returns {Row[]}
   */
  buildListRows() {
    // built already, therefore return the built one
    if (this.rows.length > 0) {
      return this.rows
    }

    this.rows = this.data?.parties?.map((p, idx) => {
      /** @type {Row} */
      const row = {
        id: '',
        cells: [],
      }

      let districtName = '全國'
      row.id = p.candNo
      row.group = districtName
      row.cells = this.buildRowFromParty(p)

      if (idx !== 0) {
        districtName = ''
      }
      row.cells.unshift([{ label: districtName }])
      return row
    })
    return this.rows
  }

  /**
   *  @override
   *  @param {string} districtName
   *  @returns {Row}
   */
  findRowByDistrictName(districtName = '全國') {
    return this.rows.find((r) => {
      return r.group === districtName
    })
  }
}

export class LegislatorIndigenousDataManager extends DataManager {
  /**
   *  @override
   *  @param {LegislatorIndigenousElection} data
   */
  constructor(data) {
    super(data)

    if (data.type === 'legislator-mountainIndigenous') {
      this.districts = [{ districtName: '全國 (山地)' }]
    } else if (data.type === 'legislator-plainIndigenous') {
      this.districts = [{ districtName: '全國 (平地)' }]
    } else {
      this.districts = [{ districtName: '全國' }]
    }
  }

  /**
   *  @return {LegislatorIndigenousElection & { districts: {districtName: string}[] }} data
   */
  getData() {
    let defaultDistrictName = '全國'

    if (this.data.type === 'legislator-mountainIndigenous') {
      defaultDistrictName = '全國 (山地)'
    } else if (this.data.type === 'legislator-plainIndigenous') {
      defaultDistrictName = '全國 (平地)'
    }

    return {
      ...this.data,
      districts: [
        {
          districtName: defaultDistrictName || '全國',
        },
      ],
    }
  }

  /**
   *  @override
   *  @returns {Head[]}
   */
  buildListHead() {
    // built already, therefore return the built one
    if (this.head.length > 0) {
      return this.head
    }
    this.head = ['地區', '號次', '姓名', '推薦政黨', '得票數', '得票率', '當選']
    return this.head
  }

  /**
   *  @param {LegislatorCandidate} c
   *  @returns {Cell[]}
   */
  buildRowFromCandidates(c) {
    return [
      // 號次
      [
        {
          label: `${c?.candNo ?? '-'}`,
        },
      ],
      // 姓名
      this.buildNameCell([c?.name]),
      // 政黨
      this.buildPartyCell([c?.party]),
      // 得票數
      [
        {
          label: c?.tks?.toLocaleString() ?? '-',
        },
      ],
      // 得票率
      [
        {
          label: typeof c?.tksRate === 'number' ? `${c?.tksRate}%` : '-',
        },
      ],
      // 當選
      [
        {
          imgJsx: c?.candVictor ? <ElectedIcon /> : null,
        },
      ],
    ]
  }
  /**
   *  @override
   *  @returns {Row[]}
   */
  buildListRows() {
    // built already, therefore return the built one
    if (this.rows.length > 0) {
      return this.rows
    }

    this.rows = []

    /** @type {LegislatorIndigenousElection} */
    const data = this.data
    data?.candidates?.forEach((c, cIdx) => {
      /** @type {Row} */
      const row = {
        id: '',
        cells: [],
        group: '',
      }

      let districtName = ''
      row.group = districtName
      row.id = c.candNo
      if (cIdx === 0) {
        districtName = this.districts?.[0]?.districtName
      }
      row.cells = this.buildRowFromCandidates(c)
      row.cells.unshift([{ label: districtName }])
      this.rows.push(row)
    })

    return this.rows
  }

  /**
   *  @override
   *  @param {string} districtName
   *  @returns {Row}
   */
  findRowByDistrictName(districtName = '全國') {
    return this.rows.find((r) => {
      return r.group === districtName
    })
  }
}

export class ReferendumDataManager extends DataManager {
  /**
   *  @override
   *  @param {ReferendumElection} data
   */
  constructor(data) {
    super(data)
    this.districts = [{ districtName: '全國' }]
  }

  /**
   *  @return {ReferendumElection & { districts: {districtName: string}[] }} data
   */
  getData() {
    return {
      ...this.data,
      districts: [
        {
          districtName: '全國',
        },
      ],
    }
  }

  /**
   *  @override
   *  @returns {Head[]}
   */
  buildListHead() {
    // built already, therefore return the built one
    if (this.head.length > 0) {
      return this.head
    }
    this.head = [
      '案號',
      '案名',
      '領銜人',
      '同意數',
      '同意率',
      '不同意數',
      '不同意率',
      '通過註記',
    ]
    return this.head
  }

  /**
   *  @param {Proposition} p
   *  @returns {Cell[]}
   */
  buildRowFromPropostion(p) {
    return [
      // 案號
      [
        {
          label: `${p?.no ?? '-'}`,
        },
      ],
      // 案名
      [
        {
          label: `${p?.content ?? '-'}`,
          multiLines: true,
        },
      ],
      // 領銜人
      [
        {
          label: `${p?.planner ?? '-'}`,
        },
      ],
      // 同意數
      [
        {
          label: p?.agreeTks?.toLocaleString() ?? '-',
        },
      ],
      // 同意率
      [
        {
          label: p?.agreeRate?.toLocaleString() ?? '-',
        },
      ],
      // 不同意數
      [
        {
          label: p?.disagreeTks?.toLocaleString() ?? '-',
        },
      ],
      // 不同意率
      [
        {
          label: p?.disagreeRate?.toLocaleString() ?? '-',
        },
      ],
      // 當選
      [
        {
          label: p?.pass ? '是' : '否',
        },
      ],
    ]
  }

  /**
   *  @override
   *  @returns {Row[]}
   */
  buildListRows() {
    // built already, therefore return the built one
    if (this.rows.length > 0) {
      return this.rows
    }

    this.rows = this.data?.propositions?.map((p) => {
      /** @type {Row} */
      const row = {
        id: '',
        cells: [],
      }

      row.id = p.no
      row.group = '全國'
      row.cells = this.buildRowFromPropostion(p)
      return row
    })
    return this.rows
  }

  /**
   *  @override
   *  @param {string} districtName
   *  @returns {Row}
   */
  findRowByDistrictName(districtName = '全國') {
    return this.rows.find((r) => {
      return r.group === districtName
    })
  }
}

export class PresidentDataManager extends DataManager {
  /**
   *  @override
   *  @param {PresidentElection} data
   */
  constructor(data) {
    super(data)
    this.districts = [{ districtName: '全國' }]
  }

  /**
   *  @return {PresidentElection & { districts: {districtName: string}[] }} data
   */
  getData() {
    return {
      ...this.data,
      districts: [
        {
          districtName: '全國',
        },
      ],
    }
  }

  /**
   *  @override
   *  @returns {Head[]}
   */
  buildListHead() {
    // built already, therefore return the built one
    if (this.head.length > 0) {
      return this.head
    }
    this.head = ['地區', '號次', '姓名', '推薦政黨', '得票數', '得票率', '當選']
    return this.head
  }

  /**
   *  @param {PresidentCandidate} c
   *  @returns {Cell[]}
   */
  buildRowFromCandidates(c) {
    return [
      // 號次
      [
        {
          label: `${c?.candNo ?? '-'}`,
        },
      ],
      // 姓名
      this.buildNameCell(c.names),
      // 政黨
      this.buildPartyCell(c.parties).map((entity) =>
        Object.assign(entity, { multiLines: true })
      ),
      // 得票數
      [
        {
          label: c?.tks?.toLocaleString() ?? '-',
        },
      ],
      // 得票率
      [
        {
          label: typeof c?.tksRate === 'number' ? `${c?.tksRate}%` : '-',
        },
      ],
      // 當選
      [
        {
          imgJsx: c?.candVictor ? <ElectedIcon /> : null,
        },
      ],
    ]
  }
  /**
   *  @override
   *  @returns {Row[]}
   */
  buildListRows() {
    // built already, therefore return the built one
    if (this.rows.length > 0) {
      return this.rows
    }

    this.rows = []

    /** @type {PresidentElection} */
    const data = this.data
    data?.candidates?.forEach((c, cIdx) => {
      /** @type {Row} */
      const row = {
        id: '',
        cells: [],
        group: '',
      }

      let districtName = ''
      row.group = districtName
      row.id = c.candNo
      if (cIdx === 0) {
        districtName = this.districts?.[0]?.districtName
      }
      row.cells = this.buildRowFromCandidates(c)
      row.cells.unshift([{ label: districtName }])
      this.rows.push(row)
    })

    return this.rows
  }

  /**
   *  @override
   *  @param {string} districtName
   *  @returns {Row}
   */
  findRowByDistrictName(districtName = '全國') {
    return this.rows.find((r) => {
      return r.group === districtName
    })
  }
}

export function dataManagerFactory() {
  return {
    /**
     *  @param {Election | ReferendumElection | LegislatorPartyElection | PresidentElection |LegislatorIndigenousElection  } data
     *  @returns {DataManager}
     */
    newDataManager: (data) => {
      switch (data?.type) {
        case 'mayor':
          return new CountyMayorDataManager(data)
        case 'councilMember':
          return new CouncilMemberDataManager(data)
        case 'legislator':
        case 'legislator-district':
          return new LegislatorDataManager(data)
        case 'legislator-plainIndigenous':
        case 'legislator-mountainIndigenous':
          return new LegislatorIndigenousDataManager(data)
        case 'legislator-party':
          return new LegislatorPartyDataManager(data)
        case 'referendum':
          return new ReferendumDataManager(data)
        case 'president':
          return new PresidentDataManager(data)
        case 'legislator-recall':
          return new RecallDataManager(data)
        default: {
          return new DataManager(data)
        }
      }
    },
  }
}

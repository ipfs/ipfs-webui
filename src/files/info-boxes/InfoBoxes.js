import React from 'react'
import PropTypes from 'prop-types'
import CompanionInfo from './companion-info/CompanionInfo.js'
import AddFilesInfo from './add-files-info/AddFilesInfo.js'

const InfoBoxes = ({ isRoot, isCompanion, filesExist }) => (
  <div>
    { isRoot && isCompanion && <CompanionInfo /> }
    { isRoot && !filesExist && !isCompanion && <AddFilesInfo /> }
  </div>
)

InfoBoxes.propTypes = {
  isRoot: PropTypes.bool.isRequired,
  isCompanion: PropTypes.bool.isRequired,
  filesExist: PropTypes.bool.isRequired
}

export default InfoBoxes

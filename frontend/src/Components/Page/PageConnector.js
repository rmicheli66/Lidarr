import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createSelector } from 'reselect';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import { saveDimensions, setIsSidebarVisible } from 'Store/Actions/appActions';
import { fetchCustomFilters } from 'Store/Actions/customFilterActions';
import { fetchArtist } from 'Store/Actions/artistActions';
import { fetchTags } from 'Store/Actions/tagActions';
import { fetchQualityProfiles, fetchLanguageProfiles, fetchMetadataProfiles, fetchUISettings, fetchImportLists } from 'Store/Actions/settingsActions';
import { fetchStatus } from 'Store/Actions/systemActions';
import ErrorPage from './ErrorPage';
import LoadingPage from './LoadingPage';
import Page from './Page';

function testLocalStorage() {
  const key = 'lidarrTest';

  try {
    localStorage.setItem(key, key);
    localStorage.removeItem(key);

    return true;
  } catch (e) {
    return false;
  }
}

const selectAppProps = createSelector(
  (state) => state.app.isSidebarVisible,
  (state) => state.app.version,
  (state) => state.app.isUpdated,
  (state) => state.app.isDisconnected,
  (isSidebarVisible, version, isUpdated, isDisconnected) => {
    return {
      isSidebarVisible,
      version,
      isUpdated,
      isDisconnected
    };
  }
);

const selectIsPopulated = createSelector(
  (state) => state.artist.isPopulated,
  (state) => state.customFilters.isPopulated,
  (state) => state.tags.isPopulated,
  (state) => state.settings.ui.isPopulated,
  (state) => state.settings.qualityProfiles.isPopulated,
  (state) => state.settings.languageProfiles.isPopulated,
  (state) => state.settings.metadataProfiles.isPopulated,
  (state) => state.settings.importLists.isPopulated,
  (state) => state.system.status.isPopulated,
  (
    artistIsPopulated,
    customFiltersIsPopulated,
    tagsIsPopulated,
    uiSettingsIsPopulated,
    qualityProfilesIsPopulated,
    languageProfilesIsPopulated,
    metadataProfilesIsPopulated,
    importListsIsPopulated,
    systemStatusIsPopulated
  ) => {
    return (
      artistIsPopulated &&
      customFiltersIsPopulated &&
      tagsIsPopulated &&
      uiSettingsIsPopulated &&
      qualityProfilesIsPopulated &&
      languageProfilesIsPopulated &&
      metadataProfilesIsPopulated &&
      importListsIsPopulated &&
      systemStatusIsPopulated
    );
  }
);

const selectErrors = createSelector(
  (state) => state.artist.error,
  (state) => state.customFilters.error,
  (state) => state.tags.error,
  (state) => state.settings.ui.error,
  (state) => state.settings.qualityProfiles.error,
  (state) => state.settings.languageProfiles.error,
  (state) => state.settings.metadataProfiles.error,
  (state) => state.settings.importLists.error,
  (state) => state.system.status.error,
  (
    artistError,
    customFiltersError,
    tagsError,
    uiSettingsError,
    qualityProfilesError,
    languageProfilesError,
    metadataProfilesError,
    importListsError,
    systemStatusError
  ) => {
    const hasError = !!(
      artistError ||
      customFiltersError ||
      tagsError ||
      uiSettingsError ||
      qualityProfilesError ||
      languageProfilesError ||
      metadataProfilesError ||
      importListsError ||
      systemStatusError
    );

    return {
      hasError,
      artistError,
      customFiltersError,
      tagsError,
      uiSettingsError,
      qualityProfilesError,
      languageProfilesError,
      metadataProfilesError,
      importListsError,
      systemStatusError
    };
  }
);

function createMapStateToProps() {
  return createSelector(
    (state) => state.settings.ui.item.enableColorImpairedMode,
    selectIsPopulated,
    selectErrors,
    selectAppProps,
    createDimensionsSelector(),
    (
      enableColorImpairedMode,
      isPopulated,
      errors,
      app,
      dimensions
    ) => {
      return {
        ...app,
        ...errors,
        isPopulated,
        isSmallScreen: dimensions.isSmallScreen,
        enableColorImpairedMode
      };
    }
  );
}

function createMapDispatchToProps(dispatch, props) {
  return {
    dispatchFetchArtist() {
      dispatch(fetchArtist());
    },
    dispatchFetchCustomFilters() {
      dispatch(fetchCustomFilters());
    },
    dispatchFetchTags() {
      dispatch(fetchTags());
    },
    dispatchFetchQualityProfiles() {
      dispatch(fetchQualityProfiles());
    },
    dispatchFetchLanguageProfiles() {
      dispatch(fetchLanguageProfiles());
    },
    dispatchFetchMetadataProfiles() {
      dispatch(fetchMetadataProfiles());
    },
    dispatchFetchImportLists() {
      dispatch(fetchImportLists());
    },
    dispatchFetchUISettings() {
      dispatch(fetchUISettings());
    },
    dispatchFetchStatus() {
      dispatch(fetchStatus());
    },
    onResize(dimensions) {
      dispatch(saveDimensions(dimensions));
    },
    onSidebarVisibleChange(isSidebarVisible) {
      dispatch(setIsSidebarVisible({ isSidebarVisible }));
    }
  };
}

class PageConnector extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isLocalStorageSupported: testLocalStorage()
    };
  }

  componentDidMount() {
    if (!this.props.isPopulated) {
      this.props.dispatchFetchArtist();
      this.props.dispatchFetchCustomFilters();
      this.props.dispatchFetchTags();
      this.props.dispatchFetchQualityProfiles();
      this.props.dispatchFetchLanguageProfiles();
      this.props.dispatchFetchMetadataProfiles();
      this.props.dispatchFetchImportLists();
      this.props.dispatchFetchUISettings();
      this.props.dispatchFetchStatus();
    }
  }

  //
  // Listeners

  onSidebarToggle = () => {
    this.props.onSidebarVisibleChange(!this.props.isSidebarVisible);
  }

  //
  // Render

  render() {
    const {
      isPopulated,
      hasError,
      dispatchFetchArtist,
      dispatchFetchTags,
      dispatchFetchQualityProfiles,
      dispatchFetchLanguageProfiles,
      dispatchFetchMetadataProfiles,
      dispatchFetchImportLists,
      dispatchFetchUISettings,
      dispatchFetchStatus,
      ...otherProps
    } = this.props;

    if (hasError || !this.state.isLocalStorageSupported) {
      return (
        <ErrorPage
          {...this.state}
          {...otherProps}
        />
      );
    }

    if (isPopulated) {
      return (
        <Page
          {...otherProps}
          onSidebarToggle={this.onSidebarToggle}
        />
      );
    }

    return (
      <LoadingPage />
    );
  }
}

PageConnector.propTypes = {
  isPopulated: PropTypes.bool.isRequired,
  hasError: PropTypes.bool.isRequired,
  isSidebarVisible: PropTypes.bool.isRequired,
  dispatchFetchArtist: PropTypes.func.isRequired,
  dispatchFetchCustomFilters: PropTypes.func.isRequired,
  dispatchFetchTags: PropTypes.func.isRequired,
  dispatchFetchQualityProfiles: PropTypes.func.isRequired,
  dispatchFetchLanguageProfiles: PropTypes.func.isRequired,
  dispatchFetchMetadataProfiles: PropTypes.func.isRequired,
  dispatchFetchImportLists: PropTypes.func.isRequired,
  dispatchFetchUISettings: PropTypes.func.isRequired,
  dispatchFetchStatus: PropTypes.func.isRequired,
  onSidebarVisibleChange: PropTypes.func.isRequired
};

export default withRouter(
  connect(createMapStateToProps, createMapDispatchToProps)(PageConnector)
);

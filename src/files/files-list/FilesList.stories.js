import React from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import i18nDecorator from '../../i18n-decorator';
import DndDecorator from '../../dnd-decorator';
import FilesList from './FilesList';
// Fixtures
import filesListA from './fixtures/list-with-10-files.json';
import filesListC from './fixtures/list-with-100-files.json';
import filesListE from './fixtures/list-with-1000-files.json';
import filesListF from './fixtures/list-with-5000-files.json';


/**
 * @type {import('@storybook/react').Meta}
 */
export default {
    title: 'Files/Files List',
    decorators: [i18nDecorator, DndDecorator, withKnobs],
};

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ListWith10Files = () => (
    <div className="h-100">
        <FilesList
            root="/"
            filesPathInfo={{ isMfs: true }}
            pins={[]}
            files={filesListA}
            filesIsFetching={boolean('filesIsFetching', false)}
            onShare={action('Share')}
            onInspect={action('Inspect')}
            onRename={action('Rename')}
            onDownload={action('Download')}
            onRemove={action('Remove')}
            onNavigate={action('Navigate')}
            onCancelUpload={action('Cancel Upload')}
            maxWidth={'100%'}
            filesSorting={{ by: 'name', asc: true }}
        />
    </div>
);

ListWith10Files.story = {
    name: 'List with 10 files',
};

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ListWith100Files = () => (
    <div className="h-100">
        <FilesList
            root="/"
            filesPathInfo={{ isMfs: true }}
            pins={[]}
            files={filesListC}
            filesIsFetching={boolean('filesIsFetching', false)}
            onShare={action('Share')}
            onInspect={action('Inspect')}
            onRename={action('Rename')}
            onDownload={action('Download')}
            onRemove={action('Remove')}
            onNavigate={action('Navigate')}
            onCancelUpload={action('Cancel Upload')}
            maxWidth={'100%'}
            filesSorting={{ by: 'name', asc: true }}
        />
    </div>
);

ListWith100Files.story = {
    name: 'List with 100 files',
};

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ListWith1000Files = () => (
    <div className="h-100">
        <FilesList
            root="/"
            filesPathInfo={{ isMfs: true }}
            pins={[]}
            files={filesListE}
            filesIsFetching={boolean('filesIsFetching', false)}
            onShare={action('Share')}
            onInspect={action('Inspect')}
            onRename={action('Rename')}
            onDownload={action('Download')}
            onRemove={action('Remove')}
            onNavigate={action('Navigate')}
            onCancelUpload={action('Cancel Upload')}
            maxWidth={'100%'}
            filesSorting={{ by: 'name', asc: true }}
        />
    </div>
);

ListWith1000Files.story = {
    name: 'List with 1000 files',
};

/**
 * @type {import('@storybook/react').StoryObj}
 */
export const ListWith5000Files = () => (
    <div className="h-100">
        <FilesList
            root="/"
            filesPathInfo={{ isMfs: true }}
            pins={[]}
            files={filesListF}
            filesIsFetching={boolean('filesIsFetching', false)}
            onShare={action('Share')}
            onInspect={action('Inspect')}
            onRename={action('Rename')}
            onDownload={action('Download')}
            onRemove={action('Remove')}
            onNavigate={action('Navigate')}
            onCancelUpload={action('Cancel Upload')}
            maxWidth={'100%'}
            filesSorting={{ by: 'name', asc: true }}
        />
    </div>
);

ListWith5000Files.story = {
    name: 'List with 5000 files',
};

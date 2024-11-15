import React, { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { LocalStorageKeys } from 'librechat-data-provider';
import { useLocalize, useCategories } from '~/hooks';
import { cn, createDropdownSetter } from '~/utils';
import { SelectDropDown } from '~/components/ui';

const CategorySelector = (props) => {
  const { currentCategory, onValueChange, className = '', tabIndex } = props;

  const localize = useLocalize();
  const { control, watch, setValue } = useFormContext();
  const { categories, emptyCategory } = useCategories();

  const watchedCategory = watch('category');
  const categoryOption = useMemo(
    () =>
      categories.find((category) => category.value === (watchedCategory ?? currentCategory)) ??
      emptyCategory,
    [watchedCategory, categories, currentCategory, emptyCategory],
  );

  return (
    <Controller
      name="category"
      control={control}
      render={() => (
        <SelectDropDown
          title="Category"
          tabIndex={tabIndex}
          value={categoryOption || ''}
          setValue={createDropdownSetter((value) => {
            setValue('category', value, { shouldDirty: false });
            localStorage.setItem(LocalStorageKeys.LAST_PROMPT_CATEGORY, value);
            if (onValueChange) {
              onValueChange(value);
            }
          })}
          availableValues={categories}
          showAbove={false}
          showLabel={false}
          emptyTitle={true}
          showOptionIcon={true}
          searchPlaceholder={localize('com_ui_search_categories')}
          className={cn('h-10 w-56 cursor-pointer', className)}
          currentValueClass="text-md gap-2"
          optionsListClass="text-sm max-h-72"
        />
      )}
    />
  );
};

export default CategorySelector;



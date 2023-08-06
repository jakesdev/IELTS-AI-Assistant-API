export enum ProductCategory {
    E_COMMERCE = 'E_COMMERCE',
    APPLICATION_UI = 'APPLICATION_UI',
    PAGE_SECTION = 'PAGE_SECTION',
    PLAN = 'PLAN'
}

export type ProductCategoryType = keyof typeof ProductCategory;

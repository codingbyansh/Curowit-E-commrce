import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../data/mockData';
import { Home, ChevronRight } from 'lucide-react';

interface CrumbItem {
  label: string;
  onClick?: () => void;
}

export const BreadcrumbNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedCategory,
    setSelectedCategory,
    selectedProduct,
    selectedCreator,
    searchQuery,
    setSearchQuery,
    navigateToCategory,
  } = useStore();

  // Do not display breadcrumb bar on the main landing homepage or admin portal
  if (activeView === 'home' || activeView === 'admin') {
    return null;
  }

  const goToView = (view: string) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const crumbs: CrumbItem[] = [
    {
      label: 'Home',
      onClick: () => goToView('home'),
    },
  ];

  if (activeView === 'shop') {
    const activeCatObj =
      selectedCategory !== 'all'
        ? CATEGORIES.find(
            (c) =>
              c.id === selectedCategory ||
              c.slug === selectedCategory ||
              c.name.toLowerCase() === selectedCategory.toLowerCase()
          )
        : null;

    if (activeCatObj || searchQuery.trim()) {
      crumbs.push({
        label: 'Shop',
        onClick: () => {
          setSelectedCategory('all');
          setSearchQuery('');
          goToView('shop');
        },
      });

      if (activeCatObj) {
        crumbs.push({
          label: activeCatObj.name,
          onClick: searchQuery.trim()
            ? () => {
                setSearchQuery('');
              }
            : undefined,
        });
      }

      if (searchQuery.trim()) {
        crumbs.push({
          label: `Search: "${searchQuery.trim()}"`,
        });
      }
    } else {
      crumbs.push({
        label: 'Shop All Collections',
      });
    }
  } else if (activeView === 'product') {
    crumbs.push({
      label: 'Shop',
      onClick: () => {
        setSelectedCategory('all');
        goToView('shop');
      },
    });

    if (selectedProduct) {
      crumbs.push({
        label: selectedProduct.category,
        onClick: () => navigateToCategory(selectedProduct.category),
      });
      crumbs.push({
        label: selectedProduct.name,
      });
    } else {
      crumbs.push({
        label: 'Product Details',
      });
    }
  } else if (activeView === 'workshops') {
    crumbs.push({
      label: 'Workshops',
      onClick: () => goToView('workshops'),
    });
    crumbs.push({
      label: 'Artisan Craft Workshops',
    });
  } else if (activeView === 'stories') {
    crumbs.push({
      label: 'Stories',
      onClick: () => goToView('stories'),
    });
    crumbs.push({
      label: 'Studio Journal & Creative Essays',
    });
  } else if (activeView === 'creators') {
    crumbs.push({
      label: 'Creators',
    });
  } else if (activeView === 'creator') {
    crumbs.push({
      label: 'Creators',
      onClick: () => goToView('creators'),
    });
    crumbs.push({
      label: selectedCreator ? selectedCreator.name : 'Maker Studio',
    });
  } else if (activeView === 'cart') {
    crumbs.push({
      label: 'Shop',
      onClick: () => goToView('shop'),
    });
    crumbs.push({
      label: 'Shopping Bag',
    });
  } else if (activeView === 'wishlist') {
    crumbs.push({
      label: 'Shop',
      onClick: () => goToView('shop'),
    });
    crumbs.push({
      label: 'Saved Wishlist',
    });
  } else if (activeView === 'account') {
    crumbs.push({
      label: 'My Account',
    });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full bg-[#FFF8EA]/70 border-b border-[#07545A]/10 py-2.5 px-4 sm:px-6 lg:px-8 select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <ol className="flex items-center flex-wrap gap-1.5 text-xs sm:text-[13px] text-[#173B3D]/75 min-w-0">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            const isFirst = idx === 0;

            return (
              <li key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5 min-w-0">
                {idx > 0 && (
                  <ChevronRight
                    className="w-3.5 h-3.5 text-[#07545A]/40 shrink-0"
                    aria-hidden="true"
                  />
                )}

                {crumb.onClick && !isLast ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="inline-flex items-center gap-1 font-medium text-[#173B3D]/75 hover:text-[#07545A] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isFirst && <Home className="w-3.5 h-3.5 text-[#07545A]/80 shrink-0" />}
                    <span>{crumb.label}</span>
                  </button>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={`inline-flex items-center gap-1 truncate max-w-[200px] sm:max-w-[340px] md:max-w-md ${
                      isLast ? 'font-bold text-[#07545A]' : 'font-medium text-[#173B3D]/75'
                    }`}
                  >
                    {isFirst && <Home className="w-3.5 h-3.5 text-[#07545A] shrink-0" />}
                    <span className="truncate">{crumb.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ScrollToTop from '@/components/common/ScrollToTop'
import ClientArticleDetailPage from '@/components/user/article/ClientArticleDetailPage'
import ClientArticleListPage from '@/components/user/article/ClientArticleListPage'
import DashboardHome from '@/pages/admin/dashboard/content/DashBoardHome'
import LayoutAdmin from '@/pages/admin/LayoutAdmin'
import ArticleDetailPage from '@/pages/admin/manage-article/detail/ArticleDetailPage'
import ArticlePage from '@/pages/admin/manage-article/page'
import BrandPage from '@/pages/admin/manage-brand/page'
import CategoryPage from '@/pages/admin/manage-category/page'
import ColorPage from '@/pages/admin/manage-color/page'
import OrderPage from '@/pages/admin/manage-order/page'
import ProductPage from '@/pages/admin/manage-product/page'
import PromotionPage from '@/pages/admin/manage-promotion/page'
import ReceiptPage from '@/pages/admin/manage-receipt/page'
import ReviewPage from '@/pages/admin/manage-review/page'
import TagPage from '@/pages/admin/manage-tag/page'
import UserPage from '@/pages/admin/manage-user/page'
import VariantPage from '@/pages/admin/manage-variant/page'
import VersionPage from '@/pages/admin/manage-version/page'
import VoucherPage from '@/pages/admin/manage-voucher/page'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import CartPage from '@/pages/user/cart/CartPage'
import CheckoutPage from '@/pages/user/checkout/CheckoutPage'
import ClientLayout from '@/pages/user/ClientLayout'
import HomePage from '@/pages/user/home/HomePage'
import VnPayReturnPage from '@/pages/user/payment/VnPayReturnPage'
import ProductDetailPage from '@/pages/user/product-detail/ProductDetailPage'
import ProductListPage from '@/pages/user/product-list/ProductListPage'
import AddressesPage from '@/pages/user/profile/AddressesPage'
import ChangePasswordPage from '@/pages/user/profile/ChangePasswordPage'
import OffersPage from '@/pages/user/profile/OffersPage'
import OrdersPage from '@/pages/user/profile/OrdersPage'
import OverviewPage from '@/pages/user/profile/OverviewPage'
import ProfileLayout from '@/pages/user/profile/ProfileLayout'
import RewardsPage from '@/pages/user/profile/RewardsPage'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster
        richColors
        expand={true}
        position='bottom-right'
        duration={3000}
        visibleToasts={5}
        closeButton
      />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* <Route path='*' element={<NotFound404 />} /> */}
          {/* TODO: tạo các public route */}
          <Route element={<ClientLayout />}>
            <Route path='/' element={<HomePage />} />
            <Route path='/cart' element={<CartPage />} />
            <Route path='/products' element={<ProductListPage />} />
            <Route path='/product/:slug' element={<ProductDetailPage />} />
            <Route path='/checkout' element={<CheckoutPage />} />
            <Route path='/articles' element={<ClientArticleListPage />} />
            <Route path='/articles/:slug' element={<ClientArticleDetailPage />} />
            <Route element={<ProfileLayout />}>
              <Route path='/profile' element={<OverviewPage />} />
              <Route path='/orders' element={<OrdersPage />} />
              <Route path='/addresses' element={<AddressesPage />} />
              <Route path='/change-password' element={<ChangePasswordPage />} />
              <Route path='/rewards' element={<RewardsPage />} />
              <Route path='/offers' element={<OffersPage />} />
            </Route>
          </Route>

          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/forgot-password' element={<ForgotPasswordPage />} />
          <Route path='/payment/vnpay-return' element={<VnPayReturnPage />} />

          {/* TODO: tạo protected route */}
          <Route element={<ProtectedRoute />}>
            {/* <Route path='/profile' element={<ProfilePage />} /> */}
            <Route path='/dashboard' element={<LayoutAdmin />}>
              <Route index element={<DashboardHome />} />
              <Route path='users' element={<UserPage />} />
              <Route path='categories' element={<CategoryPage />} />
              <Route path='brands' element={<BrandPage />} />
              <Route path='tags' element={<TagPage />} />
              <Route path='products' element={<ProductPage />} />
              <Route path='products/:productId/variants' element={<VariantPage />} />
              <Route path='colors' element={<ColorPage />} />
              <Route path='versions' element={<VersionPage />} />
              <Route path='vouchers' element={<VoucherPage />} />
              <Route path='promotions' element={<PromotionPage />} />
              <Route path='receipts' element={<ReceiptPage />} />
              <Route path='orders' element={<OrderPage />} />
              <Route path='articles' element={<ArticlePage />} />
              <Route path='articles/:id' element={<ArticleDetailPage />} />
              <Route path='reviews' element={<ReviewPage />} />
            </Route>
          </Route>
          {/* <Route path='/' element={<TestPage />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

export default function LogoCloud() {
    return (
        <section className="bg-background overflow-hidden py-16">
            <div className="group relative m-auto max-w-7xl px-6">
                <div className="flex flex-col items-center md:flex-row">
                    <div className="md:max-w-44 md:border-r md:pr-6">
                        <p className="text-end text-sm">Trusted by leading healthcare providers</p>
                    </div>
                    <div className="relative py-6 md:w-[calc(100%-11rem)]">
                        <InfiniteSlider
                            speedOnHover={20}
                            speed={40}
                            gap={112}>
                            <div className="flex">
                                <span className="mx-auto text-lg font-semibold text-muted-foreground/80 dark:text-muted-foreground/60">
                                    All India Institute of Medical Sciences
                                </span>
                            </div>

                            <div className="flex">
                                <span className="mx-auto text-lg font-semibold text-muted-foreground/80 dark:text-muted-foreground/60">
                                    Apollo Hospitals
                                </span>
                            </div>

                            <div className="flex">
                                <span className="mx-auto text-base font-medium text-muted-foreground/80 dark:text-muted-foreground/60">
                                    Medanta
                                </span>
                            </div>

                            <div className="flex">
                                <span className="mx-auto text-lg font-semibold text-muted-foreground/80 dark:text-muted-foreground/60">
                                    Fortis Healthcare
                                </span>
                            </div>

                            <div className="flex">
                                <span className="mx-auto text-base font-medium text-muted-foreground/80 dark:text-muted-foreground/60">
                                    Tata Memorial Hospital
                                </span>
                            </div>

                            <div className="flex">
                                <span className="mx-auto text-lg font-semibold text-muted-foreground/80 dark:text-muted-foreground/60">
                                    Max Healthcare
                                </span>
                            </div>

                            <div className="flex">
                                <span className="mx-auto text-lg font-bold text-muted-foreground/80 dark:text-muted-foreground/60">
                                    Lilavati Hospital
                                </span>
                            </div>

                            <div className="flex">
                                <span className="mx-auto text-lg font-medium text-muted-foreground/80 dark:text-muted-foreground/60">
                                    Kokilaben Hospital
                                </span>
                            </div>
                        </InfiniteSlider>

                        <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                        <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                        <ProgressiveBlur
                            className="pointer-events-none absolute left-0 top-0 h-full w-20"
                            direction="left"
                            blurIntensity={1}
                        />
                        <ProgressiveBlur
                            className="pointer-events-none absolute right-0 top-0 h-full w-20"
                            direction="right"
                            blurIntensity={1}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
